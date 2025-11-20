import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page6 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 6</h2>
    <AdGrid start={1001} end={1200} />
    <Footer />
  </>
);

export default Page6;
