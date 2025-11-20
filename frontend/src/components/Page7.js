import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page7 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 7</h2>
    <AdGrid start={1201} end={1400} />
    <Footer />
  </>
);

export default Page7;
