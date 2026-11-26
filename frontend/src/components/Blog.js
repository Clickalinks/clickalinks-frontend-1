import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import './Blog.css';

const Blog = () => {
  return (
    <>
      <SEO
        title="CLICKaLINKS Blog | Games, Apps, and Tap. Get. Play."
        description="Notes on placing a game or app on CLICKaLINKS. A square from £1 a day, a store page when someone taps, and Get opens the App Store or Google Play."
        keywords="indie game promotion, app store grid, clickalinks blog, tap get play, £1 a day"
      />
      <div className="blog-page">
        <div className="blog-hero">
          <div className="container">
            <h1>CLICKaLINKS Blog</h1>
            <p className="blog-hero-subtitle">
              Games, apps, and how a square gets someone to the store
            </p>
            <p className="blog-hero-description">
              Practical notes for developers placing a game, and for players using the grid.
            </p>
          </div>
        </div>

        <div className="blog-content">
          <div className="container">
            <article className="blog-article featured">
              <div className="article-header">
                <div className="article-meta">
                  <span className="article-date">November 25, 2026</span>
                  <span className="article-category">Featured • Games</span>
                </div>
                <h2 className="article-title">
                  A square for a game, from £1 a day
                </h2>
              </div>
              <div className="article-body">
                <p>
                  CLICKaLINKS is a grid of games and apps. Tap a square and a store-style page opens:
                  the icon, the name, the rating, a few screenshots, and a Get button. Get opens the
                  App Store on iPhone and Google Play on Android. The install happens in the store.
                </p>
                <h3>Who a square is for</h3>
                <p>
                  A solo developer or a small studio that has just shipped. Large studios already buy
                  installs elsewhere. A square here is a simple place to be seen while a game is new,
                  at £1 a day, for 10, 20, 30 or 60 days.
                </p>
                <h3>What you need</h3>
                <p>
                  An app icon, the game name, and a link to the App Store or Google Play. Players who
                  press Get are sent to that link. Written reviews stay on the store.
                </p>
                <h3>What a player does</h3>
                <p>
                  On a computer, rest on a square. On a phone, tap it. Read the short page, then press
                  Get. If the game is free, the store shows that. The price of the square is what the
                  developer pays to be on the grid, not what the player pays to download.
                </p>
                <p>
                  <Link to="/">Open the grid</Link> or <Link to="/how-it-works">read how a square is placed</Link>.
                </p>
              </div>
            </article>

            <div className="blog-resources">
              <h3>More</h3>
              <div className="cta-buttons">
                <Link to="/how-it-works" className="cta-btn secondary">How it works</Link>
                <Link to="/help" className="cta-btn secondary">Help centre</Link>
                <Link to="/" className="cta-btn primary">Games grid</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
