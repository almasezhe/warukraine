"use client";
import React, { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/utils/supabase/client";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query"; // <-- вот тут
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // если нужно тут

export default function AuctionItems() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // возможно уберём, заменим на isLoading из useQuery
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const queryClient = new QueryClient();

  const t = useTranslations("AuctionItems");

  // -----------------------
  // 1) Авторизация / user
  // -----------------------
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setUser(decoded);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const refreshSession = async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error) {
        localStorage.setItem("authToken", data.session.access_token);
        console.log("Token refreshed successfully.");
      }
    };
    refreshSession();
  }, []);

  // -----------------------
  // 2) fetchAuctionItems
  // -----------------------
  const fetchAuctionItems = async () => {
    console.log("Fetching auction items...");
    queryClient.invalidateQueries("auctionItems");

    const response = await fetch("/api/auction-items");
    if (!response.ok) {
      throw new Error("Failed to fetch auction items");
    }
    const data = await response.json();
    console.log("Fetched data:", data);
    return data;
  };
  

  // -----------------------
  // 3) Реактивный запрос через useQuery
  //    refetch каждые 10 секунд (10,000 ms)
  // -----------------------
  const {
    data: auctionItemsFromServer,
    isLoading,
    error: queryError,
    // isFetching, isRefetching и т.д. — если надо
  } = useQuery({
    queryKey: ["auctionItems"],       // ключ, с которым кэшируются данные
    queryFn: fetchAuctionItems,       // функция запроса
    refetchInterval: 5000,           // каждые 10 секунд рефреш
    staleTime: 0,                  // 10 секунд, пока данные "свежие"
    //cacheTime: 300000,              // время хранения в кэше
    onSuccess: (data) => {
      // Когда пришли данные с сервера, сливаем с локальным стейтом (включая таймеры + плейсхолдеры)
      // Но лучше делать это в useEffect, чтобы не смешивать
    },
  });

  // -----------------------
  // 4) Мержим данные из useQuery в стейт items
  // -----------------------
  useEffect(() => {
    // Если ещё грузится или ошибка, то пока ничего
    if (!auctionItemsFromServer) return;

    // Берём предыдущие items, обновляем их
    setItems((prevItems) => {
      // 1) Мапим все лоты, что пришли
      const updatedItems = auctionItemsFromServer.map((serverItem) => {
        const existingItem = prevItems.find((item) => item.id === serverItem.id);
        return {
          ...serverItem,
          // Если такой лот уже есть, оставляем ему time_left
          time_left: existingItem ? existingItem.time_left : serverItem.time_left,
        };
      });

      // 2) Добавляем placeholders, если меньше 5
      if (updatedItems.length < 5) {
        const placeholders = Array.from({ length: 5 - updatedItems.length }, (_, index) => ({
          id: `placeholder-${index}`,
          name: "Coming Soon",
          description: "This item will be available soon!",
          current_bid: 0,
          min_raise: 0,
          time_left: 0,
          image_url: "/auction/comingsoon.jpg",
        }));
        return [...updatedItems, ...placeholders];
      }

      return updatedItems;
    });
  }, [auctionItemsFromServer]);

  // -----------------------
  // 5) Локальный таймер для time_left
  // -----------------------
  useEffect(() => {
    // Если React Query еще что-то грузит — можно подождать,
    // но в принципе, если items пустые, таймеру всё равно
    if (isLoading) return;

    // Запускаем интервал на 1с
    const intervalId = setInterval(() => {
      setItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          time_left: Math.max(item.time_left - 1, 0),
        }))
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // -----------------------
  // 6) Открытие/закрытие модалок + Place Bid
  // -----------------------
  const openModal = (item) => {
    if (!item) {
      toast.error("Invalid item.");
      return;
    }
    setSelectedItem({
      ...item,
      bid: item.current_bid + item.min_raise,
    });
    setCurrentImageIndex(0);
    setPaymentType("");
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleBidChange = (change, minRaise) => {
    setSelectedItem((prevItem) => {
      if (!prevItem) return null;
      const newBid = Math.max(
        prevItem.current_bid + minRaise,
        (prevItem.bid || prevItem.current_bid) + change
      );
      return {
        ...prevItem,
        bid: newBid,
      };
    });
  };

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  // Place Bid
  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to place a bid");
      return;
    }

    if (!paymentType) {
      toast.error("Payment type not chosen!");
      return;
    }

    if (!selectedItem || !selectedItem.id || !selectedItem.bid) {
      toast.error("Invalid bid data");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Missing token");
        return;
      }

      const response = await fetch(`/api/place-bid/${selectedItem.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newBid: selectedItem.bid,
          paymentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place bid");
      }

      const updatedItem = await response.json();
      // Обновим локальный стейт — нашли нужный item по id и заменили
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );

      toast.success("Bid placed successfully!");
      closeModal();
      fetchAuctionItems();
    } catch (err) {
      console.error("Error placing bid:", err);
      toast.error(err.message || "Failed to place bid. Try again.");
    }
  };

  // -----------------------
  // 7) Рендер компонента
  // -----------------------

  // Если ещё грузим запрос через useQuery
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: "calc(100vh - 64px)",
          backgroundColor: "#1a202c",
          color: "white",
        }}
      >
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Если ошибка пришла из useQuery
  if (queryError) {
    return <div>{String(queryError)}</div>;
  }

  return (
    <div className="bg-gray-900 text-white h-auto py-12 ">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastStyle={{
          marginTop: "60px",
          backgroundColor: "#1f2937",
          color: "#fff",
          border: "1px solid #374151",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        }}
        progressStyle={{ backgroundColor: "#2563eb" }}
      />
      <h1 className="text-3xl font-bold text-center mb-8">Auction Items</h1>

      {/* Grid of items */}
      <div
        className="grid gap-6 px-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => openModal(item)}
            className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 hover:border-yellow-500 transition-transform duration-300"
            style={{
              border: "2px solid transparent",
            }}
          >
            {/* Timer */}
            <div className="absolute top-2 left-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm font-semibold">
              {formatTime(item.time_left)}
            </div>

            {/* Item Image */}
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover"
            />

            {/* Content */}
            <div className="p-4 bg-gray-900 text-white text-center">
              <h2 className="text-xl font-bold mb-2">{item.name}</h2>
              <p className="text-gray-400 text-sm mb-4 truncate">
                {item.description}
              </p>
              {/* Divider */}
              <hr className="border-t border-gray-600 mb-4" />
              {/* Current Bid */}
              <p className="font-semibold text-lg">
                Current Bid:{" "}
                <span className="text-yellow-500 font-bold">
                  ${item.current_bid.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal of selected item */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-800 text-white rounded-lg p-6 max-w-4xl w-full flex flex-col lg:flex-row gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image gallery */}
            <div className="lg:w-1/2 w-full">
              <img
                src={
                  selectedItem.images?.[currentImageIndex] ||
                  selectedItem.image_url
                }
                alt={selectedItem.name}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
              />
              {selectedItem.images && selectedItem.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {selectedItem.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index}`}
                      className={`w-16 h-16 object-cover rounded cursor-pointer ${
                        index === currentImageIndex
                          ? "border-2 border-yellow-500"
                          : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details + Bidding */}
            <div className="lg:w-1/2 w-full flex flex-col justify-between">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  {selectedItem.name}
                </h2>
                <p className="text-gray-400 mb-4">{selectedItem.description}</p>
                <p className="font-semibold">
                  Current Bid:{" "}
                  <span className="text-yellow-500">
                    ${selectedItem.current_bid}
                  </span>
                </p>
                <p className="font-semibold mt-2">
                  Min Raise:{" "}
                  <span className="text-yellow-500">
                    ${selectedItem.min_raise}
                  </span>
                </p>
              </div>

              {/* Bidding + "I agree with terms" */}
              <div className="mt-4">
                {/* Секция изменения ставки */}
                <div className="flex items-center mb-4">
                  <button
                    className="bg-gray-600 px-4 py-2 rounded-l"
                    onClick={() => handleBidChange(-1, selectedItem.min_raise)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={
                      selectedItem.bid ||
                      selectedItem.current_bid + selectedItem.min_raise
                    }
                    onChange={(e) => {
                      const newBid = parseFloat(e.target.value) || "";
                      setSelectedItem((prevItem) => ({
                        ...prevItem,
                        bid: newBid,
                      }));
                    }}
                    onBlur={() => {
                      setSelectedItem((prevItem) => {
                        const minBid =
                          prevItem.current_bid + prevItem.min_raise;
                        return {
                          ...prevItem,
                          bid: prevItem.bid >= minBid ? prevItem.bid : minBid,
                        };
                      });
                    }}
                    className="w-24 text-center bg-gray-700"
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "textfield",
                      margin: 0,
                      padding: 0,
                    }}
                  />
                  <button
                    className="bg-blue-600 px-4 py-2 rounded-r"
                    onClick={() => handleBidChange(1, selectedItem.min_raise)}
                  >
                    +
                  </button>
                </div>

                {/* Выбор типа оплаты */}
                <div className="mb-4">
                  <label
                    htmlFor="paymentSelect"
                    className="block mb-1 text-gray-300"
                  >
                    Choose Payment Type:
                  </label>
                  <select
                    id="paymentSelect"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded py-2 px-3 w-full"
                  >
                    <option value="">-- Select --</option>
                    <option value="Paypal">Paypal</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {/* Чекбокс + кнопка (показать модалку с правилами) */}
                <div className="flex items-center mb-2 space-x-2">
                  <label htmlFor="agree" className="text-xs text-gray-400">
                    By clicking on button you agree with{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-400 underline"
                    >
                      terms
                    </button>
                  </label>
                </div>

                <button
                  onClick={handlePlaceBid}
                  className={`w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold`}
                >
                  Place Bid
                </button>
                <button
                  onClick={closeModal}
                  className="mt-2 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка с текстом Terms (Public Offer Auction) */}
      {showTermsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-gray-800 text-gray-100 rounded-lg p-6 max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowTermsModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Auction Terms</h2>
            <div className="max-h-96 overflow-y-auto space-y-4 text-sm leading-relaxed">
              <p className="text-gray-200 font-semibold">PUBLIC CONTRACT (OFFER)</p>
              <p className="text-gray-400">
                1.1 The Auction is part of the , has its own rules for
                transactions set out below, but in addition follows all the
                basic(general) Site Rules.
                <br />
                1.2 By bidding at the auction, you confirm that you have read
                and agree to the Auction Rules.
                <br />
                1.3 Auction on the site is an auction of military themes, on
                which items (trophies) of military themes, equipment and
                military clothing can be bought.
                <br />
                1.4 All prices at the auction are indicated in dollars ($).
              </p>
              <p className="text-gray-400">
                <strong>2. Duties of the auction participants</strong>
                <br />
                2.1 Bidders are obliged to enter their real and valid data in
                the settings of payment and delivery options.
                <br />
                2.2 By creating a lot and specifying a minimum (starting) price
                for the lot, the seller undertakes to sell this lot to any user
                who wins it, even after one bid with a minimum step.
                <br />
                2.3 By placing a bid on a lot, the buyer agrees to buy the lot
                at the price he has indicated, without any additional
                requirements to the seller or specification of details of the
                lot. All questions about the lot must be clarified before
                placing a bid.
              </p>
              <p className="text-gray-400">
                <strong>3. Prices, terms and conditions</strong>
                <br />
                3.1 Bidding is free of charge.
                <br />
                3.2 After winning the lot, the buyer must pay the full amount of
                the lot to the seller's details + delivery costs, which will be
                specified on the lot page, within 2 days. If the lot is not paid
                within this time, the buyer loses the right to the lot, and
                depending on the choice of the seller, the lot either goes to
                the user who made the previous bid, or re-created.
                <br />
                3.2.1 Only after payment of the lot and delivery costs, the
                Seller undertakes to send the lot.
                <br />
                3.2.2 The price of delivery depends on the volume and weight of
                the item.
                <br />
                3.3 After receiving payment for the lot, the seller is obliged
                to actually dispatch the lot within 14 days.
                <br />
                3.4 If a bid on the lot was made less than 10 minutes before the
                end of the auction, the auction end time will be extended by
                another 10 minutes from the time of the last bid.
              </p>
              <p className="text-gray-400">
                <strong>
                  4. The first bid for a lot may be equal to the starting price.
                </strong>
              </p>
              <p className="text-gray-400">
                <strong>
                  5. Payment of the costs of the buying process by the auction
                  participants
                </strong>
                <br />
                5.1 All costs of payment for the lot are the responsibility of
                the buyer.
                <br />
                5.2 All shipping costs are the responsibility of the buyer
              </p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
