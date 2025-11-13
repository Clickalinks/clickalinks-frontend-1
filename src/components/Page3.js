import React from "react";
import AdGrid from "./AdGrid";
import Header from "./Header";
import Footer from "./Footer";

const Page3 = () => (
  <>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "20px" }}>Page 3</h2>
    <AdGrid start={401} end={600} />
    <Footer />
  </>
);

export default Page3;
