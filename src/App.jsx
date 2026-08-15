import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import mourankontransfertlogo from "./medias/mourankontransferlogo.png";
import "./SimulateurConverter.css";



const TRANSFER_CONFIG = {
  TD_MA: {
    from: {
      country: "Tchad",
      flag: "🇹🇩",
      currency: "FCFA",
    },

    to: {
      country: "Maroc",
      flag: "🇲🇦",
      currency: "MAD",
    },

    // 1 MAD = 64 FCFA
    rate: 64,

    // 4% de commission
    commission: 0.04,

    depositPhone: "+235 65 64 63 64",
    withdrawalPhone: "+212 7 63 08 46 30",
  },

  MA_TD: {
    from: {
      country: "Maroc",
      flag: "🇲🇦",
      currency: "MAD",
    },

    to: {
      country: "Tchad",
      flag: "🇹🇩",
      currency: "FCFA",
    },

    // 1 MAD = 64 FCFA
    rate: 64,

    // Aucun frais
    commission: 0,

    depositPhone: "212763084630",
    withdrawalPhone: "23565646364",
  },
};


function App() {
  /* =======================================================
     ETAT DU CORRIDOR

     TD_MA = Tchad → Maroc
     MA_TD = Maroc → Tchad
  ======================================================= */

  const [direction, setDirection] = useState("TD_MA");


  /* =======================================================
     MODE DE CALCUL

     SEND =
     "Vous envoyez"

     RECEIVE =
     "Le bénéficiaire doit recevoir"
  ======================================================= */

  const [calculationMode, setCalculationMode] =
    useState("SEND");


  /* =======================================================
     MONTANTS

     Les deux restent TOUJOURS de vrais inputs.
  ======================================================= */

  const [fromAmount, setFromAmount] = useState("100000");
  const [toAmount, setToAmount] = useState("");


  /* =======================================================
     CONFIGURATION COURANTE
  ======================================================= */

  const config = TRANSFER_CONFIG[direction];

  const {
    from,
    to,
    rate,
    commission,
    depositPhone,
    withdrawalPhone,
  } = config;


  /* =======================================================
     HELPERS
  ======================================================= */

  const sanitizeAmount = (value) => {
    return value
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1");
  };


  const formatNumber = (
    value,
    decimals = 2
  ) => {

    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "";
    }

    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  };


  /* =======================================================
     CONVERSION
     
     Le taux est défini comme :

     1 MAD = 64 FCFA
  ======================================================= */


  /**
   * Convertit le montant de FROM vers TO
   * AVANT commission.
   */
  const convertFromTo = (amount) => {

    if (!amount || Number(amount) <= 0) {
      return 0;
    }

    const numericAmount = Number(amount);

    /*
      Tchad → Maroc

      FCFA → MAD
      FCFA / 64
    */

    if (direction === "TD_MA") {
      return numericAmount / rate;
    }


    /*
      Maroc → Tchad

      MAD → FCFA
      MAD × 64
    */

    return numericAmount * rate;
  };


  /**
   * Convertit le montant TO vers FROM
   * AVANT commission.
   */
  const convertToFrom = (amount) => {

    if (!amount || Number(amount) <= 0) {
      return 0;
    }

    const numericAmount = Number(amount);


    /*
      Tchad → Maroc

      MAD → FCFA
      MAD × 64
    */

    if (direction === "TD_MA") {
      return numericAmount * rate;
    }


    /*
      Maroc → Tchad

      FCFA → MAD
      FCFA / 64
    */

    return numericAmount / rate;
  };


  /* =======================================================
     CALCUL DEPUIS LE MONTANT ENVOYÉ
  ======================================================= */

  const calculateFromAmount = (amount) => {

    const convertedAmount =
      convertFromTo(amount);


    /*
      La commission est prélevée sur
      le montant converti.

      Exemple :

      100 000 FCFA
      ↓
      1 562.50 MAD
      ↓
      - 4%
      ↓
      1 500 MAD NET
    */

    const netAmount =
      convertedAmount *
      (1 - commission);


    return netAmount;
  };


  /* =======================================================
     CALCUL DEPUIS LE MONTANT À RECEVOIR
  ======================================================= */

  const calculateRequiredFromAmount = (
    amount
  ) => {

    /*
      Si commission = 0

      montant à envoyer =
      montant à recevoir converti
    */

    if (commission === 0) {
      return convertToFrom(amount);
    }


    /*
      Avec commission :

      montant brut =
      montant net / (1 - commission)

      Exemple :

      1 500 MAD net
      /
      0.96
      =
      1 562.50 MAD brut
    */

    const grossAmount =
      Number(amount) /
      (1 - commission);


    return convertToFrom(
      grossAmount
    );
  };


  /* =======================================================
     CHANGEMENT DU MONTANT FROM
  ======================================================= */

  const handleFromAmountChange = (
    event
  ) => {

    const value =
      sanitizeAmount(
        event.target.value
      );


    setFromAmount(value);


    if (value === "") {
      setToAmount("");
      return;
    }


    /*
      Si l'utilisateur modifie
      "Vous envoyez"
    */

    const calculatedAmount =
      calculateFromAmount(value);


    setToAmount(
      calculatedAmount
        ? calculatedAmount.toFixed(2)
        : ""
    );
  };


  /* =======================================================
     CHANGEMENT DU MONTANT TO
  ======================================================= */

  const handleToAmountChange = (
    event
  ) => {

    const value =
      sanitizeAmount(
        event.target.value
      );


    setToAmount(value);


    if (value === "") {
      setFromAmount("");
      return;
    }


    /*
      Si l'utilisateur modifie
      "Le bénéficiaire doit recevoir"
    */

    const calculatedAmount =
      calculateRequiredFromAmount(
        value
      );


    setFromAmount(
      calculatedAmount
        ? calculatedAmount.toFixed(2)
        : ""
    );
  };


  /* =======================================================
     TOGGLE HORIZONTAL
     
     Change :

     🇹🇩 Tchad → 🇲🇦 Maroc

     en

     🇲🇦 Maroc → 🇹🇩 Tchad

     MAIS NE CHANGE PAS LE MODE
     SEND / RECEIVE.
  ======================================================= */

  const handleDirectionToggle = () => {

    const newDirection =
      direction === "TD_MA"
        ? "MA_TD"
        : "TD_MA";


    setDirection(newDirection);


    /*
      On conserve le montant "from"
      comme référence.

      On recalcule simplement
      le montant "to" avec les
      nouvelles règles.
    */

    const currentAmount =
      Number(fromAmount);


    if (
      !currentAmount ||
      currentAmount <= 0
    ) {
      setToAmount("");
      return;
    }


    const newConfig =
      TRANSFER_CONFIG[newDirection];


    let convertedAmount;


    if (newDirection === "TD_MA") {

      convertedAmount =
        currentAmount /
        newConfig.rate;

    } else {

      convertedAmount =
        currentAmount *
        newConfig.rate;
    }


    /*
      Application de la commission
    */

    convertedAmount *=
      1 - newConfig.commission;


    setToAmount(
      convertedAmount.toFixed(2)
    );
  };


  /* =======================================================
     TOGGLE VERTICAL
     
     Change uniquement le mode :

     SEND
     ↓
     RECEIVE

     Les pays ne changent PAS.
  ======================================================= */

  const handleCalculationToggle = () => {

    setCalculationMode(
      previous =>
        previous === "SEND"
          ? "RECEIVE"
          : "SEND"
    );
  };


  /* =======================================================
     WHATSAPP
  ======================================================= */

  const openWhatsApp = (
    phone,
    agentType
  ) => {

    let message = "";


    if (
      direction === "TD_MA"
    ) {

      if (
        agentType === "deposit"
      ) {

        message =
          `Bonjour, je souhaite effectuer un transfert Tchad → Maroc.

Montant à envoyer : ${formatNumber(
            fromAmount,
            2
          )} FCFA

Montant à recevoir : ${formatNumber(
            toAmount,
            2
          )} MAD

Commission : ${commission * 100}%

Merci de m'indiquer la procédure à suivre.`;

      } else {

        message =
          `Bonjour, je souhaite effectuer un transfert Tchad → Maroc.

Montant envoyé : ${formatNumber(
            fromAmount,
            2
          )} FCFA

Montant à retirer : ${formatNumber(
            toAmount,
            2
          )} MAD

Merci de m'indiquer la procédure à suivre.`;
      }

    } else {

      if (
        agentType === "deposit"
      ) {

        message =
          `Bonjour, je souhaite effectuer un transfert Maroc → Tchad.

Montant à envoyer : ${formatNumber(
            fromAmount,
            2
          )} MAD

Montant à recevoir : ${formatNumber(
            toAmount,
            2
          )} FCFA

Commission : 0%

Merci de m'indiquer la procédure à suivre.`;

      } else {

        message =
          `Bonjour, je souhaite effectuer un transfert Maroc → Tchad.

Montant envoyé : ${formatNumber(
            fromAmount,
            2
          )} MAD

Montant à retirer : ${formatNumber(
            toAmount,
            2
          )} FCFA

Merci de m'indiquer la procédure à suivre.`;
      }
    }


    const url =
      `https://api.whatsapp.com/send/?phone=${phone}` +
      `&text=${encodeURIComponent(message)}` +
      `&type=phone_number` +
      `&app_absent=0`;


    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div className="brand">

           <img
    src={mourankontransfertlogo}
    alt="mourakontransfert"
    className="brand-logo"
  />

  <span className="brand-name">
    Mourakon
  </span>

        

        </div>


        <button className="simulator-btn">
          SIMULATEUR
        </button>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main-container" >


        {/* =================================================
            SIMULATEUR
        ================================================= */}

        <section className="simulator-card">


          {/* ===============================================
              DIRECTION
          =============================================== */}

          <div className="country-selector">


            {/* FROM */}

            <div className="country">

              <div className="flag">
                {from.flag}
              </div>

              <span>
                {from.country}
              </span>

            </div>


            <span className="arrow">
              →
            </span>


            {/* TO */}

            <div className="country">

              <div className="flag">
                {to.flag}
              </div>

              <span>
                {to.country}
              </span>

            </div>


            {/* TOGGLE HORIZONTAL */}

            <button
              type="button"
              className="switch-btn"
              onClick={
                handleDirectionToggle
              }
              aria-label="Changer le sens du transfert"
              title="Changer le sens du transfert"
            >
              ⇄
            </button>

          </div>


          {/* ===============================================
              MONTANTS
          =============================================== */}

          <div className="amount-container">


            {/* =============================================
                FROM INPUT
            ============================================= */}

            <div className="amount-group">

              <label>

                {calculationMode === "SEND"
                  ? "VOUS ENVOYEZ"
                  : "VOUS DEVEZ ENVOYER"}

              </label>


              <div className="amount-input">

                <input
                  type="text"
                  inputMode="decimal"
                  value={fromAmount}
                  onChange={
                    handleFromAmountChange
                  }
                  placeholder="100 000"
                  className="amount-field"
                  aria-label={`Montant en ${from.currency}`}
                />


                <span className="currency">
                  {from.currency}
                </span>

              </div>

            </div>


            {/* =============================================
                TOGGLE VERTICAL
            ============================================= */}

            <button
              type="button"
              className="swap-icon"
              onClick={
                handleCalculationToggle
              }
              aria-label="Inverser le mode de calcul"
              title="Inverser le mode de calcul"
            >
              ⇅
            </button>


            {/* =============================================
                TO INPUT
            ============================================= */}

            <div className="amount-group">

              <label className="receiver-label">

                {calculationMode === "SEND"
                  ? "LE BÉNÉFICIAIRE REÇOIT (NET)"
                  : "LE BÉNÉFICIAIRE DOIT RECEVOIR"}

              </label>


              <div className="amount-input">

                <input
                  type="text"
                  inputMode="decimal"
                  value={toAmount}
                  onChange={
                    handleToAmountChange
                  }
                  placeholder="1 500"
                  className="amount-field"
                  aria-label={`Montant en ${to.currency}`}
                />


                <span className="currency">
                  {to.currency}
                </span>

              </div>

            </div>

          </div>


          {/* ===============================================
              TAUX + COMMISSION
          =============================================== */}

          <div className="rate-container">


            <div className="rate">

              1 MAD = {rate} FCFA

            </div>


            <div className="fee">

              Commission{" "}
              {commission * 100}%

            </div>

          </div>

        </section>


        {/* =================================================
            TRANSFERT
        ================================================= */}

        <section className="transfer-section">


          <div className="transfer-header">

            <h1>
              Transférez maintenant
            </h1>

            <p>

              Contactez un agent WhatsApp pour
              valider
              <br />
              l’opération en 2 minutes.

            </p>

          </div>


          {/* ===============================================
              AGENT DÉPÔT
          =============================================== */}

          <div className="agent-card" onClick={() =>
                openWhatsApp(
                  depositPhone,
                  "deposit"
                )
              }>

            <div className="agent-info">

              <div className="agent-flag">
                {from.flag}
              </div>


              <div>

                <strong>

                  Dépôt {from.country}

                </strong>


                <span>

                  {depositPhone}

                </span>

              </div>

            </div>


            <button
              type="button"
              className="whatsapp-btn"
              onClick={() =>
                openWhatsApp(
                  depositPhone,
                  "deposit"
                )
              }
              aria-label={`Contacter l'agent de dépôt ${from.country}`}
            >

              <span>
                <FaWhatsapp />
              </span>

            </button>

          </div>


          {/* ===============================================
              AGENT RETRAIT
          =============================================== */}

          <div className="agent-card" onClick={() =>
                openWhatsApp(
                  withdrawalPhone,
                  "withdrawal"
                )
              }>

            <div className="agent-info">

              <div className="agent-flag">
                {to.flag}
              </div>


              <div>

                <strong>

                  Retrait {to.country}

                </strong>


                <span>

                  {withdrawalPhone}

                </span>

              </div>

            </div>


            <button
              type="button"
              className="whatsapp-btn"
              onClick={() =>
                openWhatsApp(
                  withdrawalPhone,
                  "withdrawal"
                )
              }
              aria-label={`Contacter l'agent de retrait ${to.country}`}
            >

              <span>
                <FaWhatsapp />
              </span>

            </button>

          </div>

        </section>

      </main>



      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">
        © 2026 Mourakon Transfert
      </footer>

    </div>
  );
}
export default App;