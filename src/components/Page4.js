import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page4 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 4</h2>
    <AdGrid start={601} end={800} />
    <Footer />
  </>
);

export default Page4;
