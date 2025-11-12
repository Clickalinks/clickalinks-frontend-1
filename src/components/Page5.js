import React from "react";
import AdGrid from "../components/AdGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Page5 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 5</h2>
    <AdGrid start={801} end={1000} />
    <Footer />
  </>
);

export default Page5;
