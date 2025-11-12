import React from "react";
import AdGrid from "../components/AdGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Page6 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 6</h2>
    <AdGrid start={1001} end={1200} />
    <Footer />
  </>
);

export default Page6;
