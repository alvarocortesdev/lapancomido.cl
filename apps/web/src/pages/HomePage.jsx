// src/pages/HomePage.jsx

import { useEffect, useMemo, useState } from "react";

/* Import Swiper */
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* Importar Cloudinary config */
import { getGalleryImageUrl, optimizeCloudinaryUrl } from "../config/cloudinary";

/* Importar Site Content Context */
import { useSiteContent } from "../context/SiteContentContext";

/* Importar Categorías FakeAPI */
import { Categories } from "../components/Categories";

/* Importar Framer Motion */
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  /* Get site content from context */
  const { content } = useSiteContent();
  const slides = content.home_slider || [];
  const allImages = useMemo(() => content.home_gallery || [], [content.home_gallery]);
  const aboutSection = content.about_section || {};

  /* Responsive: render only mobile or desktop image */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Lógica BentoGrid dinámico con transiciones */
  const [displayedImages, setDisplayedImages] = useState([]);
  const [previousSwapPositions, setPreviousSwapPositions] = useState([]);
  const [imageKeys, setImageKeys] = useState([]); // Para forzar re-render con animación

  // Inicializar con 8 imágenes aleatorias
  useEffect(() => {
    if (allImages.length === 0) return;
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    const initial = shuffled.slice(0, 8);
    setDisplayedImages(initial);
    setImageKeys(initial.map((_, i) => i)); // Keys iniciales
  }, [allImages]);

  // Ciclo de intercambio cada 3 segundos
  useEffect(() => {
    if (displayedImages.length === 0) return;

    const interval = setInterval(() => {
      setDisplayedImages((currentDisplayed) => {
        // Obtener imágenes que NO están actualmente en la grilla
        const availableImages = allImages.filter(
          (img) => !currentDisplayed.includes(img)
        );

        // Seleccionar 3 posiciones aleatorias distintas a las anteriores
        const allPositions = [0, 1, 2, 3, 4, 5, 6, 7];
        const validPositions = allPositions.filter(
          (pos) => !previousSwapPositions.includes(pos)
        );

        // Si no hay suficientes posiciones válidas, usar cualquiera
        const positionsToUse =
          validPositions.length >= 3 ? validPositions : allPositions;

        // Seleccionar 3 posiciones al azar
        const shuffledPositions = [...positionsToUse].sort(
          () => 0.5 - Math.random()
        );
        const newSwapPositions = shuffledPositions.slice(0, 3);

        // Actualizar previousSwapPositions para el próximo ciclo
        setPreviousSwapPositions(newSwapPositions);

        // Seleccionar 3 nuevas imágenes aleatorias
        const shuffledAvailable = [...availableImages].sort(
          () => 0.5 - Math.random()
        );
        const newImages = shuffledAvailable.slice(0, 3);

        // Crear nuevo array con las imágenes intercambiadas
        const updatedDisplayed = [...currentDisplayed];
        newSwapPositions.forEach((pos, index) => {
          if (newImages[index]) {
            updatedDisplayed[pos] = newImages[index];
          }
        });

        // Actualizar keys para las posiciones cambiadas (forzar re-render con animación)
        setImageKeys((currentKeys) => {
          const newKeys = [...currentKeys];
          newSwapPositions.forEach((pos) => {
            newKeys[pos] = Date.now() + pos; // Key único para triggear animación
          });
          return newKeys;
        });

        return updatedDisplayed;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [displayedImages.length, allImages, previousSwapPositions]);


  // Helper to get image URL - handles both full URLs and image names
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return optimizeCloudinaryUrl(img, { width: 800 });
    return getGalleryImageUrl(img);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-3 sm:px-4">
        {/* Galería / Slider - Full width con aspect ratio para que la imagen calce */}
        <section className="mt-4 mb-8 sm:mt-0 sm:mb-8 -mx-3 sm:mx-0">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            speed={1800}
            loop={true}
            loopAdditionalSlides={3}
            centeredSlides={false}
            watchOverflow={true}
            className="w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/9] lg:aspect-[21/9] sm:rounded-lg overflow-hidden"
            style={{ "--swiper-theme-color": "#262011" }}
          >
            {slides.map((slide, index) => {
              const mobileSrc = optimizeCloudinaryUrl(
                slide.mobile || slide.desktop || slide.url,
                { width: 640 },
              );
              const desktopSrc = optimizeCloudinaryUrl(slide.desktop || slide.url, {
                width: 1200,
              });
              const fetchPriority = index === 0 ? "high" : "auto";

              return (
                <SwiperSlide key={index}>
                  {isMobile ? (
                    <img
                      src={mobileSrc}
                      alt={slide.alt || `Slide ${index + 1}`}
                      width="640"
                      height="360"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={fetchPriority}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={desktopSrc}
                      alt={slide.alt || `Slide ${index + 1}`}
                      width="1200"
                      height="514"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={fetchPriority}
                      className="w-full h-full object-contain"
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </section>

        {/* Categorías */}
        <section className="mb-8 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Categorías</h2>
          <Categories />
        </section>

        {/* Productos Grid - Responsive */}
        <section className="mb-8 sm:my-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {displayedImages.map((img, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden shadow-lg aspect-square relative"
              >
                <AnimatePresence mode="sync">
                  <motion.img
                    key={imageKeys[index] || index}
                    src={getImageUrl(img)}
                    alt={`Producto ${index + 1}`}
                    width="400"
                    height="400"
                    loading={index < 4 ? "eager" : "lazy"}
                    className="w-full h-full object-cover absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Elígenos - Texto arriba del video en mobile, al lado en desktop */}
        <section className="mb-8 sm:my-12 lg:my-20">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
            {/* Texto - primero en móvil, primero en desktop */}
            <div className="lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                {aboutSection.title || 'Elígenos'}
              </h2>
              {aboutSection.content ? (
                <div 
                  className="text-sm sm:text-base text-gray-700 space-y-4 [&>p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: aboutSection.content }}
                />
              ) : (
                <div className="text-sm sm:text-base text-gray-700 space-y-4">
                  <p>
                    En el corazón del puerto de Caldera, nace &quot;La Pan
                    Comido&quot;, una micro-panadería online que revoluciona la forma
                    en que se disfruta del pan. Nuestro objetivo es ofrecer un pan
                    sano y beneficioso para la salud, elaborado con masa madre y un
                    proceso de fermentación que dura 17 horas, lo que le da un sabor y
                    una textura únicos.
                  </p>
                  <p>
                    Respetamos las recetas más tradicionales de pan, utilizando
                    técnicas y ingredientes que han sido perfeccionados a lo largo de
                    los años. Nuestros panes son el resultado de un proceso de
                    elaboración que dura 2 días, desde el amasado hasta la salida del
                    horno, lo que nos permite ofrecer un producto de alta calidad y
                    sabor auténtico.
                  </p>
                  <p>
                    Fundada en el año 2020, &quot;La Pan Comido&quot; se ha convertido
                    en una referencia para aquellos que buscan un pan auténtico y
                    delicioso. Nos enfocamos en ofrecer un producto que se asemeja a
                    la tradición de las panaderías italianas, donde el pan es un arte
                    y una pasión.
                  </p>
                </div>
              )}
            </div>

            {/* Video - segundo en móvil, segundo en desktop */}
            {aboutSection.video && (
              <div className="w-full">
                <div className="aspect-video lg:aspect-square rounded-lg overflow-hidden">
                  <video
                    src={aboutSection.video}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
