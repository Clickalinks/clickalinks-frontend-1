import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page1 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 1</h2>
    <AdGrid start={1} end={200} />
    <Footer />
  </>
);

export default Page1;
