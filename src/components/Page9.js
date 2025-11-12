import React from "react";
import AdGrid from "../components/AdGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Page9 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 9</h2>
    <AdGrid start={1601} end={1800} />
    <Footer />
  </>
);

export default Page9;
