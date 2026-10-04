import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  heroImages = ['../images/hero1.jpg', '../images/hero2.jpg', '../images/hero3.jpg', '../images/hero4.png'];
  current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    this.play();
    inject(DestroyRef).onDestroy(() => this.pause());
  }

  next() {
    this.current.update((i) => (i + 1) % this.heroImages.length);
  }

  prev() {
    this.current.update((i) => (i - 1 + this.heroImages.length) % this.heroImages.length);
  }

  goTo(index: number) {
    this.current.set(index);
  }

  play() {
    // this.pause();
    // Skip autoplay for people who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.timer = setInterval(() => this.next(), 2000);
  }

  pause() {
    clearInterval(this.timer);
  }

  categories = [
    {
      name: 'Skis & snowboards',
      description: 'All-mountain, powder and park setups.',
      image: '../images/products/sb-ang1.png', // change to your file names
      span: 'md:col-span-2 md:row-span-2',
    },
    {
      name: 'Boots',
      description: 'A fit that holds through the last run.',
      image: '../images/products/boot-ang1.png',
      span: 'md:col-span-2',
    },
    {
      name: 'Gloves & mittens',
      description: 'Warm, waterproof, dexterous.',
      image: '../images/products/glove-code2.png',
      span: 'md:col-span-1',
    },
    {
      name: 'Helmets & goggles',
      description: 'Protection with clear vision.',
      image: '../images/products/hat-react1.png',
      span: 'md:col-span-1',
    },
  ];

  promises = [
    {
      title: 'Free returns',
      text: 'Changed your mind or wrong size? Send it back within 30 days.',
    },
    { title: 'Size guides', text: 'Boot, board and glove guides on every product page.' },
    { title: 'Fast dispatch', text: 'Orders leave the warehouse within two working days.' },
  ];
}
