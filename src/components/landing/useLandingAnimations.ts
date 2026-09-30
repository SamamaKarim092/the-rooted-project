"use client";

import { useEffect, useRef } from "react";

export function useLandingAnimations() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ─────────────────────────────────────────────────────────────
    // 1. Wrap Words for Word-by-Word Reveal
    // ─────────────────────────────────────────────────────────────
    const wordRevealRoots = container.querySelectorAll<HTMLElement>("[data-reveal-words]");
    wordRevealRoots.forEach((root) => {
      // Prevent double wrapping if already initialized
      if (root.dataset.wordsWrapped === "true") return;
      root.dataset.wordsWrapped = "true";

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const textNodes: Text[] = [];
      let current: Node | null;
      while ((current = walker.nextNode())) {
        if (current.textContent && current.textContent.trim() !== "") {
          textNodes.push(current as Text);
        }
      }

      let wordIndex = 0;
      textNodes.forEach((tn) => {
        const parts = (tn.textContent || "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (part.trim() === "") {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const span = document.createElement("span");
          span.className = "word-reveal";
          span.style.transitionDelay = `${wordIndex * 45}ms`;
          span.textContent = part;
          frag.appendChild(span);
          wordIndex++;
        });
        if (tn.parentNode) {
          tn.parentNode.replaceChild(frag, tn);
        }
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 2. Intersection Observer for Reveals & Panel Images
    // ─────────────────────────────────────────────────────────────
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealElements = container.querySelectorAll("[data-reveal], [data-panel-img]");
    revealElements.forEach((el) => revealObserver.observe(el));

    // ─────────────────────────────────────────────────────────────
    // 3. Parallax Scroll Effect
    // ─────────────────────────────────────────────────────────────
    let removeScrollListener: (() => void) | undefined;
    if (!reduced) {
      const parallaxElements = container.querySelectorAll<HTMLElement>("[data-parallax]");
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            parallaxElements.forEach((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.bottom > 0 && rect.top < window.innerHeight) {
                const speed = parseFloat(el.dataset.parallax || "0.2");
                const isHero = el.closest("header") !== null;
                const offset = isHero
                  ? window.scrollY * speed
                  : (rect.top - window.innerHeight * 0.5) * speed;
                el.style.transform = `translateY(${offset.toFixed(1)}px)`;
              }
            });
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      removeScrollListener = () => window.removeEventListener("scroll", handleScroll);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Cursor Follower Image Preview on Capabilities
    // ─────────────────────────────────────────────────────────────
    const previewBox = container.querySelector<HTMLElement>("#cursor-preview");
    const previewImg = container.querySelector<HTMLImageElement>("#cursor-preview-img");
    const cleanupCursorHandlers: Array<() => void> = [];

    if (previewBox && previewImg && window.matchMedia("(pointer: fine)").matches) {
      const previewRows = container.querySelectorAll<HTMLElement>("[data-preview]");
      previewRows.forEach((row) => {
        const onEnter = () => {
          const src = row.dataset.preview;
          if (src) {
            previewImg.src = src;
            previewBox.classList.remove("opacity-0", "scale-90");
            previewBox.classList.add("opacity-100", "scale-100");
          }
        };

        const onLeave = () => {
          previewBox.classList.add("opacity-0", "scale-90");
          previewBox.classList.remove("opacity-100", "scale-100");
        };

        const onMove = (e: MouseEvent) => {
          previewBox.style.left = `${e.clientX + 28}px`;
          previewBox.style.top = `${e.clientY - 80}px`;
        };

        row.addEventListener("mouseenter", onEnter);
        row.addEventListener("mouseleave", onLeave);
        row.addEventListener("mousemove", onMove);

        cleanupCursorHandlers.push(() => {
          row.removeEventListener("mouseenter", onEnter);
          row.removeEventListener("mouseleave", onLeave);
          row.removeEventListener("mousemove", onMove);
        });
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 5. In-View Video Auto-Play & Pause Observer
    // ─────────────────────────────────────────────────────────────
    const inViewVideos = container.querySelectorAll<HTMLVideoElement>("video[data-video-in-view]");
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    inViewVideos.forEach((v) => videoObserver.observe(v));

    // ─────────────────────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────────────────────
    return () => {
      revealObserver.disconnect();
      videoObserver.disconnect();
      if (removeScrollListener) removeScrollListener();
      cleanupCursorHandlers.forEach((fn) => fn());
    };
  }, []);

  return { containerRef };
}
