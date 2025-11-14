import { useEffect } from "react";

const PaymentPage = () => {
  useEffect(() => {
    const initializeBrick = async () => {
      const mp = new window.MercadoPago("TEST-153b2e60-a251-4b96-a5c3-5c728bf8745f", { locale: "es-AR" });

      const bricksBuilder = mp.bricks();
      const settings = {
        initialization: {
          amount: 10000, // opcional si usás preferenceId
          preferenceId: "<PREFERENCE_ID>", // opcional si hacés checkout directo
          payer: {
            firstName: "Nicolás",
            lastName: "Iacono",
            email: "nico@example.com",
          },
        },
        customization: {
          visual: {
            style: {
              theme: "dark",
              baseColor: "#5617a4",
              outlinePrimaryColor: "#5617a4",
              buttonTextColor: "white",
            },
            texts: {
              formTitle: "Tuinmo - Medios de pago",
            },
          },
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
            maxInstallments: 1,
          },
        },
        callbacks: {
          onSubmit: ({ selectedPaymentMethod, formData }) => {
            return fetch("https://mpserviceapp-production.up.railway.app/api/mp/process_payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData),
            })
              .then((res) => res.json())
              .then((result) => {
              })
              .catch((err) => {
                console.error("Error al procesar pago", err);
              });
          },
          onError: (error) => console.error("Brick error", error),
        },
      };

      await bricksBuilder.create("payment", "paymentBrick_container", settings);
    };

    initializeBrick();
  }, []);

  return <div id="paymentBrick_container" />;
};

export default PaymentPage;
