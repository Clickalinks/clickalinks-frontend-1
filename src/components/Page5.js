import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page5 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 5</h2>
    <AdGrid start={801} end={1000} />
    <Footer />
  </>
);

export default Page5;
