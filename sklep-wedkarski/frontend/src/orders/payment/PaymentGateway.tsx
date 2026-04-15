import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Timer, ShieldCheck, Smartphone, Landmark, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { fetchOrderById, updateOrderStatus } from "../orders.api";
import type { Order } from "../orders.types";

type PaymentMethod = "CARD" | "BLIK" | "TRANSFER";
const BANKS = [
    { id: "mbank", name: "mBank", url: "https://www.mbank.pl" },
    { id: "pkobp", name: "PKO BP", url: "https://www.ipko.pl" },
    { id: "ing", name: "ING", url: "https://www.ing.pl/" }
  ];

const PaymentGateway: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [bankUrl, setBankUrl] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [blik, setBlik] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchOrderById(Number(id))
      .then((data) => {
        if (data.stan !== "W_TRAKCIE") {
          toast.error("To zamówienie nie oczekuje na płatność.", { toastId: "status-error" });
          navigate("/profile");
          return;
        }
        setOrder(data);
      })
      .catch(() => {
        toast.error("Błąd połączenia z bazą zamówień.", { toastId: "fetch-error" });
      });

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Transakcja wygasła", { toastId: "timeout-error" });
          navigate("/profile");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [id, navigate]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    let paymentError = false;
    if (!order) return;

    if (method === "CARD" && cardNumber.length !== 19) {
      toast.warning("Niepoprawny numer karty (16 cyfr).");
      paymentError = true;
    }

    if (method === "CARD" && expiry.length !== 5) {
      toast.warning("Niepoprawna data wygaśnięcia.");
      paymentError = true;
    }
    if (method === "CARD" && cvv.length !== 3) {
      toast.warning("Niepoprawny kod CVV.");
      paymentError = true;
    }

    if (method === "BLIK" && blik.length !== 6) {
      toast.warning("Kod BLIK musi składać się z 6 cyfr.");
      paymentError = true;
    }

    if(paymentError){
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Łączenie z bankiem...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // <- delay 2s
      await updateOrderStatus(order.id_transakcji, "ZREALIZOWANE");

      toast.update(toastId, {
        render: "Dziękujemy! Płatność otrzymana.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      if (method === "TRANSFER" && bankUrl) {
        window.open(bankUrl, "_blank");
      }

      navigate("/profile");
    } catch (err) {
      toast.update(toastId, {
        render: "Błąd płatności. Spróbuj ponownie.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!order) return <div className="p-20 text-center text-slate-400">Ładowanie sesji...</div>;

  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[2rem] bg-slate-700 p-8 text-white shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Odbiorca</p>
            <h2 className="text-xl font-bold mb-6">Sklep Wędkarski "Gruba Ryba" Sp. z o.o.</h2>
            
            <div className="space-y-1 mb-6 mt-6">
              <p className="text-slate-400 text-sm">Kwota do zapłaty:</p>
              <p className="text-5xl font-black text-sky-400">{order.kwota_calkowita} <span className="text-4xl">zł</span></p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 border border-white/5">
              <Timer className="h-7 w-7 text-sky-400 animate-pulse" />
              <div className="text-sm">
                <p className="text-slate-300">Pozostały czas:</p>
                <p className="font-mono font-bold text-lg">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t font-semibold border-white/10 text-xs text-slate-500">
              ID Zamówienia: {order.id_transakcji} <br/>
              Data: {new Date(order.data).toLocaleDateString('pl-PL')}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Wybierz metodę płatności</h3>
            
            {/* TABS */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button className={`flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition ${method === "CARD" ? "border-sky-600 bg-sky-50 text-sky-700" : "border-slate-100 text-slate-500 hover:border-slate-200"}`}
                onClick={() => setMethod("CARD")}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs font-bold uppercase">Karta</span>
              </button>
              <button className={`flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition ${method === "BLIK" ? "border-sky-600 bg-sky-50 text-sky-700" : "border-slate-100 text-slate-500 hover:border-slate-200"}`}
                onClick={() => setMethod("BLIK")}
              >
                <Smartphone className="h-6 w-6" />
                <span className="text-xs font-bold uppercase">BLIK</span>
              </button>
              <button className={`flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition ${method === "TRANSFER" ? "border-sky-600 bg-sky-50 text-sky-700" : "border-slate-100 text-slate-500 hover:border-slate-200"}`}
                onClick={() => setMethod("TRANSFER")}
              >
                <Landmark className="h-6 w-6" />
                <span className="text-xs font-bold uppercase">Przelew</span>
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              {method === "CARD" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <input className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    type="text"
                    placeholder="Numer karty"
                    value={cardNumber}
                    maxLength={19}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      const formattedValue = rawValue.replace(/(\d{4})/g, "$1 ").trim();
                      setCardNumber(formattedValue);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <input className="rounded-xl border border-slate-200 p-4 outline-none focus:border-sky-500"
                      type="text" 
                      placeholder="MM/YY" 
                      value={expiry}
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        if (expiry.endsWith('/') && inputVal.length === expiry.length - 1) {
                          setExpiry(inputVal.slice(0, -1));
                          return;
                        }
                        let rawValue = inputVal.replace(/\D/g, "");
                        if (rawValue.length >= 2) {
                          setExpiry(`${rawValue.substring(0, 2)}/${rawValue.substring(2, 4)}`);
                        } else {
                          setExpiry(rawValue);
                        }
                      }}
                    />
                    <input className="rounded-xl border border-slate-200 p-4 outline-none focus:border-sky-500"
                      type="text" 
                      placeholder="CVC" 
                      maxLength={3} 
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value.replace(/\D/g, ""));
                      }}
                    />
                  </div>
                </div>
              )}

              {method === "BLIK" && (
                <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom-2">
                  <div className="mb-2"><p className="text-sm text-slate-600 mb-2">6-cyfrowy kod z aplikacji bankowej</p></div>
                  <input className="w-full max-w-[200px] text-center text-3xl font-bold tracking-[0.5em] rounded-xl border border-slate-200 p-4 outline-none focus:border-sky-500"
                    type="text"
                    placeholder="000 000"
                    maxLength={6}
                    value={blik}
                    onChange={(e) => {
                      setBlik(e.target.value.replace(/\D/g, ""));
                    }}
                  />
                </div>
              )}

              {method === "TRANSFER" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  {BANKS.map((bank) => (
                    <div className="mb-2"><label
                      key={bank.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                        bankUrl === bank.url
                          ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-semibold text-slate-700">{bank.name}</span>
                      <ChevronRight className={`h-4 w-4 transition ${bankUrl === bank.url ? "text-sky-500" : "text-slate-400"}`} />

                      <input className="hidden"
                        type="radio"
                        name="bank"
                        value={bank.url}
                        checked={bankUrl === bank.url}
                        onChange={(e) => setBankUrl(e.target.value)}
                        required
                      />
                    </label></div>
                  ))}
                </div>
              )}

              <button className="w-full rounded-2xl bg-sky-700 py-5 text-lg font-bold text-white shadow-xl shadow-sky-900/10 transition hover:bg-sky-800 active:scale-[0.98] disabled:opacity-50"
                type="submit"
                disabled={isProcessing || timeLeft === 0}
              >
                {isProcessing ? "Przetwarzanie..." : `Zapłać teraz`}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4 text-slate-300">
               <ShieldCheck className="h-5 w-5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Połączenie szyfrowane</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;