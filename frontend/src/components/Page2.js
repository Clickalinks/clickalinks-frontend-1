import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page2 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 2</h2>
    <AdGrid start={201} end={400} />
    <Footer />
  </>
);

export default Page2;
