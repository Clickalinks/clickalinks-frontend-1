import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page9 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 9</h2>
    <AdGrid start={1601} end={1800} />
    <Footer />
  </>
);

export default Page9;
