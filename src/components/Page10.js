import React from "react";
import AdGrid from "../components/AdGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Page10 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 10</h2>
    <AdGrid start={1801} end={2000} />
    <Footer />
  </>
);

export default Page10;
