import React from "react";
import AdGrid from "../components/AdGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Page2 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 2</h2>
    <AdGrid start={201} end={400} />
    <Footer />
  </>
);

export default Page2;
