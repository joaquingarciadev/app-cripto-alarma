import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import Combobox from "../components/Combobox";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [criptos, setCriptos] = useState([]);
  const [inputCripto, setInputCripto] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [criptoSelect, setCriptoSelect] = useState(null);
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    setLoading(true);
    getCriptos();
    const interval = setInterval(getCriptos, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("alarms")) {
      setAlarms(JSON.parse(localStorage.getItem("alarms")));
    }
  }, []);

  useEffect(() => {
    if (alarms.length > 0) {
      localStorage.setItem("alarms", JSON.stringify(alarms));
    } else {
      localStorage.removeItem("alarms");
    }
  }, [alarms]);

  // This code is used to check if alarms have been crossed.
  // It does this by comparing the current price of the alarm symbol
  // to the price of the alarm when it was created.
  // If the alarm has been crossed, it alerts the user and increments the
  // countCrosses property of the alarm object.
  useEffect(() => {
    if (alarms.length > 0) {
      alarms.forEach((alarm) => {
        const currentPrice = getCurrentPrice(alarm.symbol);
        const alarmCrossed = alarm.price > alarm.firstPrice
          ? alarm.price <= currentPrice
          : alarm.price >= currentPrice;

        if (alarmCrossed) {
          alert(`${alarm.symbol} ha alcanzado ${alarm.price}`);
          setAlarms(
            alarms.map((a) => {
              if (a.id === alarm.id) {
                a.firstPrice = currentPrice;
                a.countCrosses = alarm.countCrosses + 1;
              }
              return a;
            })
          );
        }
      });
    }
  }, [criptos]);

  const getCriptos = async () => {
    try {
      const res = await fetch("/api/coins");
      const data = await res.json();
      setCriptos(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const setAlarm = (e) => {
    e.preventDefault();
    if (inputCripto !== criptoSelect.symbol) {
      alert("Seleccione una criptomoneda correcta");
      return;
    }
    setAlarms([
      ...alarms,
      {
        id: randomId(),
        symbol: criptoSelect.symbol,
        price: inputPrice,
        firstPrice: criptoSelect.price,
        countCrosses: 0,
      },
    ]);
  };

  const deleteAlarm = (id) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id));
  };

  const getCurrentPrice = (symbol) => {
    const cripto = criptos.find((cripto) => cripto.symbol === symbol);
    return cripto.price;
  };

  const randomId = () => {
    return Math.floor(Math.random() * 1000000);
  };

  return (
    <div>
      <Head>
        <title>App Cripto alarma</title>
        <link rel="icon" href="/logo.png" />
      </Head>

      <main className="row m-auto p-2 vh-100 justify-content-center align-items-center gap-2">
        {loading ? (
          <div className="spinner-border" role="status"></div>
        ) : (
          <>
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  {/* FORMULARIO */}
                  <form className="m-auto p-3" onSubmit={setAlarm}>
                    <div className="text-center">
                      <Image src="/logo.png" alt="logo" priority={true} width={100} height={100} />
                    </div>
                    <div className="form-group position-relative">
                      <label>Criptomoneda</label>
                      <Combobox
                        options={
                          criptos.map((cripto) => ({
                            label: cripto.symbol + " - " + cripto.name,
                            value: cripto,
                          })) || []
                        }
                        onChange={(e) => {
                          setInputCripto(e.value.symbol);
                          setCriptoSelect(e.value);
                        }}
                        reset={inputCripto === ""}
                      />
                    </div>
                    <div className="form-group my-3">
                      <label>Precio</label>
                      <input
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          setInputPrice(e.target.value);
                        }}
                        value={inputPrice}
                        required
                      />
                    </div>
                    <div className="mb-3 d-flex justify-content-between">
                      <button
                        type="submit"
                        className="btn btn-light"
                        style={{ width: "59%" }}
                      >
                        Establecer
                      </button>
                      <button
                        type="reset"
                        className="btn btn-dark font-weight-500"
                        style={{ width: "39%" }}
                        onClick={() => {
                          setInputCripto("");
                          setInputPrice("");
                          setCriptoSelect(null);
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            {alarms?.length > 0 && (
              <div className="col-lg-6">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Alarmas</h5>
                    <div className="table-responsive">
                      {/* TABLA */}
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th scope="col">Criptomoneda</th>
                            <th scope="col">Precio</th>
                            <th scope="col">Precio actual</th>
                            <th scope="col">Veces cruzadas</th>
                            <th scope="col">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alarms.map((alarm) => {
                            return (
                              <tr key={alarm.id}>
                                <td>{alarm.symbol}</td>
                                <td>{alarm.price}</td>
                                <td>{getCurrentPrice(alarm.symbol)}</td>
                                <td>{alarm.countCrosses}</td>
                                <td>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                      deleteAlarm(alarm.id);
                                    }}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
