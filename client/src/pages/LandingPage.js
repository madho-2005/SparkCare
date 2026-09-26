import React from 'react';
import HeroSection from '../components/home/HeroSection';
import PopularServices from '../components/home/PopularServices';
import FeaturedProducts from '../components/home/FeaturedProducts';
import WhyChooseUs from '../components/home/WhyChooseUs';
import HowItWorks from '../components/home/HowItWorks';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import ContactSection from '../components/home/ContactSection';

export const LandingPage = () => {
  return (/*#__PURE__*/
    React.createElement("div", { className: "relative min-h-screen bg-bg-primary text-text-main transition-colors duration-300" }, /*#__PURE__*/


    React.createElement(HeroSection, null), /*#__PURE__*/


    React.createElement(PopularServices, null), /*#__PURE__*/


    React.createElement(WhyChooseUs, null), /*#__PURE__*/


    React.createElement(FeaturedProducts, null), /*#__PURE__*/


    React.createElement(HowItWorks, null), /*#__PURE__*/


    React.createElement(ReviewsCarousel, null), /*#__PURE__*/


    React.createElement(ContactSection, null)

    ));

};

export default LandingPage;