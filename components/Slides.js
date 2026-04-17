'use client';

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function Slides() {
  const { t } = useTranslation();
  const params = useParams();
  const lng = params.lng || 'en';

  const slidesData = [
    {
      title: t('slides.slide0.title') || "AI-Powered Health Assistant",
      text: t('slides.slide0.text') || "Predict your symptoms and find out what's bothering you.",
      linkText: t('slides.slide0.linkText') || "Get Started",
      linkTo: `/${lng}/Prediction`,
      img: "/images/Conversational.png"
    },
    {
      title: t('slides.slide1.title') || "Find Specialists Nearby",
      text: t('slides.slide1.text') || "Locate doctors, clinics, and hospitals in your city.",
      linkText: t('slides.slide1.linkText') || "Find Doctors",
      linkTo: `/${lng}/Doctors`,
      img: "/images/Male_Doctor-512.png"
    },
    {
      title: t('slides.slide2.title') || "Quick First Aid Guided",
      text: t('slides.slide2.text') || "Access essential first aid information immediately.",
      linkText: t('slides.slide2.linkText') || "First Aid Guide",
      linkTo: `/${lng}/FirstAid`,
      img: "/images/chatbot-health-care-.png"
    }
  ];

  return (
    <div className="bg-[var(--bg-color)] pt-32 pb-20 flex items-center transition-colors duration-300" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 relative">
        <div className="w-full">
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, Navigation]}
            className="mySwiper rounded-[3rem]"
            dir={lng === 'ar' ? 'rtl' : 'ltr'}
            key={lng}
          >
            {slidesData.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className="px-4 py-8">
                  <div className="bg-[var(--card-bg)] rounded-[3rem] p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto relative overflow-hidden transition-all duration-300 shadow-[var(--card-shadow)] border border-[var(--border-color)]">
                    
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    {/* Text Content */}
                    <div className={`flex-1 text-center lg:text-left ${lng === 'ar' ? 'lg:text-right' : ''}`}>
                      <h2 className="text-4xl lg:text-6xl font-black text-[var(--text-main)] mb-6 leading-tight tracking-tighter">
                        {slide.title}
                      </h2>
                      <p className="text-lg lg:text-xl text-[var(--text-muted)] mb-10 leading-relaxed font-medium">
                        {slide.text}
                      </p>
                      <Link
                        href={slide.linkTo}
                        className="inline-block px-12 py-4 bg-gradient-to-r from-[#0076f7] to-[#00c6ff] text-white text-xl font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all no-underline"
                      >
                        {slide.linkText}
                      </Link>
                    </div>

                    {/* Image */}
                    <div className="flex-1 w-full max-w-md transform hover:scale-105 transition-all duration-500">
                      <img
                        src={slide.img}
                        alt={slide.title}
                        className="w-full h-auto drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
