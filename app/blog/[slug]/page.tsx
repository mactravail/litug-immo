import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, PenLine, BookOpen } from 'lucide-react';
import '../../landing.css';
import '../blog.css';
import SiteHeader from '../../components/SiteHeader';
import { ARTICLES } from '../articles';
import NewsletterForm from './NewsletterForm';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  const title = article ? article.title : 'Article';
  return {
    title: `${title} — bientôt disponible | Litug`,
    description: "Cet article est en cours d'écriture. Inscrivez-vous pour être prévenu de sa publication.",
  };
}

export default async function ArticlePlaceholder({ params }: Props) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  return (
    <div className="landing-root">
      <SiteHeader cta={{ label: 'Commencer', href: '/#contact' }} />

      <main className="blog-soon">
        <div className="wrap blog-soon-inner">
          <span className="blog-soon-eyebrow">
            <PenLine size={14} /> En cours d&apos;écriture
          </span>

          <h1 className="blog-soon-title">
            {article ? article.title : 'Cet article arrive bientôt'}
          </h1>

          <p className="blog-soon-lead">
            Cet article est <strong>en cours d&apos;écriture</strong> par notre équipe.
            Laissez votre email pour être prévenu dès sa publication — vous serez parmi
            les premiers informés, sans spam.
          </p>

          <NewsletterForm />

          <div className="blog-soon-links">
            <Link href="/blog" className="blog-soon-back">
              <ArrowLeft size={15} /> Retour au blog
            </Link>
            <Link href="/blog" className="blog-soon-browse">
              <BookOpen size={15} /> Voir les autres guides
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
