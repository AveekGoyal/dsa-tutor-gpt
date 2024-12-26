/**
 * @dev Testimonials section component showcasing user feedback and success stories
 * Features: auto-playing carousel, animated cards, responsive layout
 */

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

/**
 * @dev Configuration for user testimonials
 * Each testimonial includes user details, avatar, and their feedback
 */
const testimonials = [
  {
    name: "Alex Chen",
    role: "Software Engineer at Google",
    avatar: "/testimonials/alex.jpg",
    content:
      "DSAGPTutor helped me crack my technical interviews. The step-by-step guidance and interactive problem-solving approach made complex algorithms much easier to understand.",
  },
  {
    name: "Sarah Johnson",
    role: "CS Student at Stanford",
    avatar: "/testimonials/sarah.jpg",
    content:
      "As a student, I found the platform incredibly helpful. The AI's ability to break down problems and explain concepts in simple terms helped me excel in my algorithms course.",
  },
  {
    name: "Michael Park",
    role: "Senior Developer at Microsoft",
    avatar: "/testimonials/michael.jpg",
    content:
      "The platform's approach to teaching DSA is revolutionary. It's like having a personal mentor who's available 24/7 to help you understand and master complex concepts.",
  },
  {
    name: "Priya Patel",
    role: "Tech Lead at Amazon",
    avatar: "/testimonials/priya.jpg",
    content:
      "What sets DSAGPTutor apart is its ability to adapt to your learning style. It helped me identify and overcome my weak points in algorithm design.",
  },
];

/**
 * @dev Main testimonials section with auto-playing carousel
 * Displays user testimonials with profile pictures and feedback in a card layout
 */
export function TestimonialsSection() {
  const [api, setApi] = useState<any>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const goToSlide = (index: number) => {
    api?.scrollTo(index);
    setActiveIndex(index);
  };

  const plugin = React.useMemo(
    () =>
      Autoplay({
        delay: 5000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    []
  );

  return (
    <section id="testimonials" className="pb-12">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary/50 via-primary to-primary/50 text-transparent bg-clip-text">
          What Our Users Say
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of developers who have transformed their DSA journey with us
        </p>
      </div>

      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[plugin]}
        setApi={setApi}
        className="w-full max-w-6xl mx-auto px-4"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial, index) => (
            <CarouselItem 
              key={index} 
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full border border-primary/20 bg-card/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col gap-4 p-6 h-[280px]">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="bg-primary/5">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? "bg-primary w-6" 
                  : "bg-primary/20 hover:bg-primary/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <CarouselPrevious className="hidden md:flex -left-12 hover:bg-primary/10" />
        <CarouselNext className="hidden md:flex -right-12 hover:bg-primary/10" />
      </Carousel>
    </section>
  );
}
