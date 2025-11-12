import React from "react";
import AdGrid from "../components/AdGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Page8 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 8</h2>
    <AdGrid start={1401} end={1600} />
    <Footer />
  </>
);

export default Page8;
