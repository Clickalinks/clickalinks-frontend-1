import React from "react";
import AdGrid from "../components/AdGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Page7 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 7</h2>
    <AdGrid start={1201} end={1400} />
    <Footer />
  </>
);

export default Page7;
