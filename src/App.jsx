import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import mourankontransfertlogo from "./medias/mourankontransferlogo.png";

import airtelMoneyLogo from "./assets/airtel-logo.png";
import bankOfAfricaLogo from "./assets/bmce.png";
import cashplusLogo from "./assets/cashplus.jpg";
import cihLogo from "./assets/cih.png";
import EcobankLogo from "./assets/Ecobank_Logo.svg";
import wafacashLogo from "./assets/wafacash.png";


import "./SimulateurConverter.css";


const PARTNERS = {
  maroc: [
    {
      name: "Cash Plus",
      logo: cashplusLogo,
    },
    {
      name: "Wafacash",
      logo: wafacashLogo,
    },
    {
      name: "Bank of Africa",
      logo: bankOfAfricaLogo,
    },
    {
      name: "CIH",
      logo: cihLogo,
    },
  ],

  tchad: [
    {
      name: "Airtel Money",
      logo: airtelMoneyLogo,
    },
     {
      name: "Ecobank",
      logo: EcobankLogo,
    },
  ],
};


/* ============================================================
   CONFIGURATION DES TRANSFERTS
   ============================================================ */

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

    // 1 MAD = 60 FCFA
    rate: 60,

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

    // 1 MAD = 60 FCFA
    rate: 60,

    // Aucun frais
    commission: 0,

    depositPhone: "212763084630",
    withdrawalPhone: "23565646364",
  },
};

function PartnersSection() {
  return (
    <div className="partners-section">

      <div className="partners-header">
        <div className="partners-title">
          <span className="partners-icon">✓</span>

          <div>
            <h3>Nos partenaires</h3>
            <p>
              Des institutions financières partenaires
              pour faciliter vos transferts.
            </p>
          </div>
        </div>
      </div>

      <div className="partners-country">

        <div className="partners-country-header">
          <span className="partners-flag">🇲🇦</span>

          <div>
            <strong>Maroc</strong>
            <span>Partenaires financiers</span>
          </div>
        </div>

        <div className="partners-grid">
          {PARTNERS.maroc.map((partner) => (
            <div
              className="partner-logo-card"
              key={partner.name}
              title={partner.name}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
              />

              <span>{partner.name}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="partners-country">

        <div className="partners-country-header">
          <span className="partners-flag">🇹🇩</span>

          <div>
            <strong>Tchad</strong>
            <span>Partenaires financiers</span>
          </div>
        </div>

        <div className="partners-grid">
          {PARTNERS.tchad.map((partner) => (
            <div
              className="partner-logo-card"
              key={partner.name}
              title={partner.name}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
              />

              <span>{partner.name}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="partners-security">
        <span>🔒</span>
        <span>
          Transferts effectués via nos partenaires de confiance
        </span>
      </div>

    </div>
  );
}


/* ============================================================
   APPLICATION
   ============================================================ */

function App() {

  /* ==========================================================
     ETAT DU CORRIDOR

     TD_MA = Tchad → Maroc
     MA_TD = Maroc → Tchad
     ========================================================== */

  const [direction, setDirection] = useState("TD_MA");


  /* ==========================================================
     MODE DE CALCUL

     SEND = "Vous envoyez"
     RECEIVE = "Le bénéficiaire doit recevoir"
     ========================================================== */

  const [calculationMode, setCalculationMode] =
    useState("SEND");


  /* ==========================================================
     MONTANTS
     ========================================================== */

  const [fromAmount, setFromAmount] =
    useState("100000");

  const [toAmount, setToAmount] =
    useState("");


  /* ==========================================================
     CONFIGURATION COURANTE
     ========================================================== */

  const config = TRANSFER_CONFIG[direction];

  const {
    from,
    to,
    rate,
    commission,
    depositPhone,
    withdrawalPhone,
  } = config;


  /* ==========================================================
     HELPERS
     ========================================================== */

  /**
   * Nettoie la saisie utilisateur.
   */
  const sanitizeAmount = (value) => {
    return value
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1");
  };


  /* ==========================================================
     ARRONDISSEMENT FCFA
     ========================================================== */

  /**
   * Arrondit toujours le FCFA au CENTAIN supérieur.
   *
   * Exemples :
   *
   * 106601     → 106700
   * 106666.67  → 106700
   * 106700     → 106700
   * 106701     → 106800
   *
   * Le client voit donc toujours un montant
   * sans décimales et payable en FCFA.
   */
  const roundFcfa = (amount) => {

    if (
      amount === "" ||
      amount === null ||
      amount === undefined
    ) {
      return 0;
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return 0;
    }

    return Math.ceil(numericAmount / 100) * 100;
  };


  /* ==========================================================
     FORMATAGE FCFA
     ========================================================== */

  /**
   * Affiche le FCFA sans aucune décimale.
   *
   * Exemple :
   *
   * 106666.67
   * ↓
   * 106700
   * ↓
   * "106 700"
   */
  const formatFcfa = (amount) => {

    if (
      amount === "" ||
      amount === null ||
      amount === undefined
    ) {
      return "";
    }

    const roundedAmount =
      roundFcfa(amount);

    if (!roundedAmount) {
      return "";
    }

    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount);
  };


  /* ==========================================================
     FORMATAGE MAD
     ========================================================== */

  /**
   * Les MAD sont affichés avec 2 décimales.
   *
   * Exemple :
   *
   * 1666.666
   * ↓
   * "1 666,67"
   */
  const formatMad = (amount) => {

    if (
      amount === "" ||
      amount === null ||
      amount === undefined
    ) {
      return "";
    }

    const number = Number(amount);

    if (Number.isNaN(number)) {
      return "";
    }

    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };


  /* ==========================================================
     FORMATAGE GÉNÉRIQUE
     ========================================================== */

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


  /* ==========================================================
     CONVERSION FROM → TO
     ========================================================== */

  /**
   * Convertit le montant FROM vers TO
   * avant commission.
   *
   * Tchad → Maroc :
   *
   * FCFA / 60 = MAD
   *
   * Maroc → Tchad :
   *
   * MAD × 60 = FCFA
   */
  const convertFromTo = (amount) => {

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      return 0;
    }

    const numericAmount =
      Number(amount);


    /* Tchad → Maroc */

    if (direction === "TD_MA") {

      return numericAmount / rate;
    }


    /* Maroc → Tchad */

    return numericAmount * rate;
  };


  /* ==========================================================
     CONVERSION TO → FROM
     ========================================================== */

  /**
   * Conversion inverse avant commission.
   */
  const convertToFrom = (amount) => {

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      return 0;
    }

    const numericAmount =
      Number(amount);


    /* Tchad → Maroc
       MAD → FCFA
    */

    if (direction === "TD_MA") {

      return numericAmount * rate;
    }


    /* Maroc → Tchad
       FCFA → MAD
    */

    return numericAmount / rate;
  };


  /* ==========================================================
     CALCUL DEPUIS LE MONTANT ENVOYÉ
     ========================================================== */

  const calculateFromAmount = (amount) => {

    const convertedAmount =
      convertFromTo(amount);


    if (!convertedAmount) {
      return 0;
    }


    /* Application de la commission */

    const netAmount =
      convertedAmount *
      (1 - commission);


    /*

       Si la destination est le Tchad,
       le résultat doit être arrondi au
       centaine supérieur.

    */

    if (direction === "MA_TD") {

      return roundFcfa(netAmount);
    }


    /*

       Si la destination est le Maroc,
       on conserve les décimales MAD.

    */

    return netAmount;
  };


  /* ==========================================================
     CALCUL DEPUIS LE MONTANT À RECEVOIR
     ========================================================== */

  const calculateRequiredFromAmount = (
    amount
  ) => {

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      return 0;
    }


    /* ========================================================
       TCHAD → MAROC
       ======================================================== */

    if (direction === "TD_MA") {

      /*
       * Le montant demandé est en MAD.
       *
       * On calcule le montant brut nécessaire
       * avant commission.
       */

      const desiredReceive =
        Number(amount);


      const grossMad =
        desiredReceive /
        (1 - commission);


      /*
       * Conversion MAD → FCFA.
       */

      const requiredFcfa =
        grossMad * rate;


      /*
       * Le client doit envoyer un montant
       * FCFA arrondi à la centaine supérieure.
       */

      return roundFcfa(requiredFcfa);
    }


    /* ========================================================
       MAROC → TCHAD
       ======================================================== */

    /*
     * Le montant demandé est en FCFA.
     *
     * On arrondit immédiatement au centaine
     * supérieur.
     */

    const desiredReceiveFcfa =
      roundFcfa(Number(amount));


    /*
     * Conversion FCFA → MAD.
     */

    const requiredMad =
      desiredReceiveFcfa / rate;


    return requiredMad;
  };


  /* ==========================================================
     CHANGEMENT DU MONTANT FROM
     ========================================================== */

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


    const calculatedAmount =
      calculateFromAmount(value);


    if (!calculatedAmount) {

      setToAmount("");

      return;
    }


    /* ========================================================
       TCHAD → MAROC
       FROM = FCFA
       TO = MAD
       ======================================================== */

    if (direction === "TD_MA") {

      setToAmount(
        Number(calculatedAmount)
          .toFixed(0)
      );

      return;
    }


    /* ========================================================
       MAROC → TCHAD
       FROM = MAD
       TO = FCFA
       ======================================================== */

    setToAmount(
      String(
        roundFcfa(
          calculatedAmount
        )
      )
    );
  };


  /* ==========================================================
     CHANGEMENT DU MONTANT TO
     ========================================================== */

  const handleToAmountChange = (
    event
  ) => {

    const value =
      sanitizeAmount(
        event.target.value
      );


    if (value === "") {

      setToAmount("");
      setFromAmount("");

      return;
    }


    /* ========================================================
       MAROC → TCHAD
       ======================================================== */

    if (direction === "MA_TD") {

      /*
       * Le montant bénéficiaire est FCFA.
       *
       * On le transforme immédiatement
       * en montant payable au centaine.
       */

      const roundedFcfa =
        roundFcfa(
          Number(value)
        );


      setToAmount(
        String(roundedFcfa)
      );


      /*
       * Calcul du montant MAD nécessaire.
       */

      const requiredMad =
        calculateRequiredFromAmount(
          roundedFcfa
        );


      setFromAmount(
        requiredMad
          ? Number(requiredMad)
              .toFixed(0)
          : ""
      );


      return;
    }


    /* ========================================================
       TCHAD → MAROC
       ======================================================== */

    setToAmount(value);


    const calculatedAmount =
      calculateRequiredFromAmount(
        value
      );


    if (!calculatedAmount) {

      setFromAmount("");

      return;
    }


    /*
     * FROM = FCFA.
     *
     * Toujours arrondi à 100.
     */

    setFromAmount(
      String(
        roundFcfa(
          calculatedAmount
        )
      )
    );
  };


  /* ==========================================================
     CHANGEMENT DE DIRECTION
     ========================================================== */

  const handleDirectionToggle = () => {

    const newDirection =
      direction === "TD_MA"
        ? "MA_TD"
        : "TD_MA";


    setDirection(newDirection);


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
      TRANSFER_CONFIG[
        newDirection
      ];


    let convertedAmount;


    /* ========================================================
       TCHAD → MAROC
       ======================================================== */

    if (newDirection === "TD_MA") {

      convertedAmount =
        currentAmount /
        newConfig.rate;

    }


    /* ========================================================
       MAROC → TCHAD
       ======================================================== */

    else {

      convertedAmount =
        currentAmount *
        newConfig.rate;
    }


    /* ========================================================
       COMMISSION
       ======================================================== */

    convertedAmount *=
      1 - newConfig.commission;


    /* ========================================================
       FORMAT FINAL
       ======================================================== */

    if (
      newDirection === "MA_TD"
    ) {

      setToAmount(
        String(
          roundFcfa(
            convertedAmount
          )
        )
      );

      return;
    }


    setToAmount(
      Number(convertedAmount)
        .toFixed(0)
    );
  };


  /* ==========================================================
     TOGGLE VERTICAL
     ========================================================== */

  const handleCalculationToggle = () => {

    setCalculationMode(
      previous =>
        previous === "SEND"
          ? "RECEIVE"
          : "SEND"
    );
  };


  /* ==========================================================
     WHATSAPP
     ========================================================== */

  const openWhatsApp = (
    phone,
    agentType
  ) => {

    let message = "";


    /* ========================================================
       TCHAD → MAROC
       ======================================================== */

    if (
      direction === "TD_MA"
    ) {

      if (
        agentType === "deposit"
      ) {

        message =
          `Bonjour, je souhaite effectuer un transfert Tchad → Maroc.

Montant à envoyer : ${formatFcfa(
            fromAmount
          )} FCFA

Montant à recevoir : ${formatMad(
            toAmount
          )} MAD

Commission : ${
            commission * 100
          }%

Merci de m'indiquer la procédure à suivre.`;

      } else {

        message =
          `Bonjour, je souhaite effectuer un transfert Tchad → Maroc.

Montant envoyé : ${formatFcfa(
            fromAmount
          )} FCFA

Montant à retirer : ${formatMad(
            toAmount
          )} MAD

Merci de m'indiquer la procédure à suivre.`;
      }


    }


    /* ========================================================
       MAROC → TCHAD
       ======================================================== */

    else {

      if (
        agentType === "deposit"
      ) {

        message =
          `Bonjour, je souhaite effectuer un transfert Maroc → Tchad.

Montant à envoyer : ${formatMad(
            fromAmount
          )} MAD

Montant à recevoir : ${formatFcfa(
            toAmount
          )} FCFA

Commission : 0%

Merci de m'indiquer la procédure à suivre.`;

      } else {

        message =
          `Bonjour, je souhaite effectuer un transfert Maroc → Tchad.

Montant envoyé : ${formatMad(
            fromAmount
          )} MAD

Montant à retirer : ${formatFcfa(
            toAmount
          )} FCFA

Merci de m'indiquer la procédure à suivre.`;
      }
    }


    /* ========================================================
       WHATSAPP URL
       ======================================================== */

    const url =
      `https://api.whatsapp.com/send/?phone=${phone}` +
      `&text=${encodeURIComponent(
        message
      )}` +
      `&type=phone_number` +
      `&app_absent=0`;


    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="page">

      {/* =====================================================
          HEADER
          ===================================================== */}

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


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="main-container">

        {/* ===================================================
            SIMULATEUR
            =================================================== */}

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

            {/* FROM */}

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
                  aria-label={
                    `Montant en ${from.currency}`
                  }
                />


                <span className="currency">
                  {from.currency}
                </span>

              </div>

            </div>


            {/* TOGGLE VERTICAL */}

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


            {/* TO */}

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
                  aria-label={
                    `Montant en ${to.currency}`
                  }
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

          <div
            className="agent-card"
            onClick={() =>
              openWhatsApp(
                depositPhone,
                "deposit"
              )
            }
          >

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
              aria-label={
                `Contacter l'agent de dépôt ${from.country}`
              }
            >

              <span>
                <FaWhatsapp />
              </span>

            </button>

          </div>


          {/* ===============================================
              AGENT RETRAIT
              =============================================== */}

          <div
            className="agent-card"
            onClick={() =>
              openWhatsApp(
                withdrawalPhone,
                "withdrawal"
              )
            }
          >

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
              aria-label={
                `Contacter l'agent de retrait ${to.country}`
              }
            >

              <span>
                <FaWhatsapp />
              </span>

            </button>

          </div>

           {/* ===============================================
              PARTENAIRES
              =============================================== */}

          <PartnersSection />

        </section>
         

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="footer">
        © 2026 Mourakon Transfert
      </footer>

    </div>
  );
}


export default App;
