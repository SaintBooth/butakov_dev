import { Code, TrendingUp, BarChart3, LayoutGrid, Wrench, BrainCircuit } from 'lucide-react';
import type { Service } from '../types';

export const services: Service[] = [
  {
    id: 'custom-web',
    title: 'Сложные веб-сервисы и стартапы',
    description:
      'Разработка кастомных платформ, SaaS, маркетплейсов и личных кабинетов с нестандартной логикой на Django 5 и Next.js 15.',
    Icon: Code,
  },
  {
    id: 'ecommerce',
    title: 'E-commerce на 1С-Битрикс',
    description:
      'Разработка интернет-магазинов любой сложности с надежной и правильной синхронизацией с 1С:УТ.',
    Icon: TrendingUp,
  },
  {
    id: 'marketing',
    title: 'Digital-маркетинг & Performance',
    description:
      'Настройка и ведение Яндекс Директ. Построение сквозной аналитики, оптимизация воронки и достижение целевых KPI.',
    Icon: BarChart3,
  },
  {
    id: 'corporate',
    title: 'Корпоративные сайты (WordPress)',
    description:
      'Быстрые, красивые и SEO-оптимизированные сайты для бизнеса. Легко управлять контентом, легко масштабировать.',
    Icon: LayoutGrid,
  },
  {
    id: 'legacy',
    title: 'Поддержка и Legacy',
    description:
      'Беру на поддержку и развитие существующие проекты на Битрикс и WordPress. Исправляю ошибки, обновляю, ускоряю.',
    Icon: Wrench,
  },
  {
    id: 'ai-consulting',
    title: 'ИИ-консалтинг',
    description:
      'Внедрение LLM и нейросетей в ваши процессы: умные боты техподдержки, генерация контента и аналитика данных.',
    Icon: BrainCircuit,
  },
];
