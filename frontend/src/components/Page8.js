import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page8 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 8</h2>
    <AdGrid start={1401} end={1600} />
    <Footer />
  </>
);

export default Page8;
