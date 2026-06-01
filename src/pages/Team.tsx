import { Linkedin, Mail, Phone, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../seo/Seo'

const team = [
  {
    name: 'Nikuj Kumar Jhanwar',
    role: 'Founder & Chief Editor',
    email: 'nikunjkumarjhawar@gmail.com',
    phone: '08595250602',
    linkedin: 'https://www.linkedin.com/in/nikunjj-jhawar',
    photo: 'team/nikunj.jpeg',
    initials: 'NK',
  },
  {
    name: 'Yashank Rathi',
    role: 'Financial Content & Discovery Lead',
    email: 'yashankrathi25@gmail.com',
    phone: '9650891869',
    linkedin: 'https://www.linkedin.com/in/yashank-rathi',
    photo: 'team/yashank.png',
    initials: 'YR',
  },
  {
    name: 'Bhawesh Agrawal',
    role: 'Web Operations Analyst',
    email: 'owner@bhaweshagrawal.com.np',
    phone: '9851633632',
    linkedin: 'https://www.linkedin.com/in/bhawesh-agrawal/',
    photo: 'team/bhawesh.png',
    initials: 'BA',
  },
]

function MemberCard({ member }: { member: (typeof team)[0] }) {
  return (
    <div className="flex flex-col">

      {/* Photo — portrait crop, consistent across all cards */}
      <div
        className="w-full mb-6 overflow-hidden"
        style={{ aspectRatio: '3 / 4', background: 'var(--bg-subtle)' }}
      >
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-full"
            style={{ display: 'block', objectFit: 'cover', objectPosition: 'top center' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center
                       font-display font-black select-none"
            style={{ color: 'var(--accent)', fontSize: '48px' }}
          >
            {member.initials}
          </div>
        )}
      </div>

      {/* Name */}
      <h3
        className="font-display font-black mb-1"
        style={{
          fontSize: '20px',
          lineHeight: '1.3',
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
        }}
      >
        {member.name}
      </h3>

      {/* Role */}
      <p
        className="mb-5"
        style={{
          fontSize: '13px',
          color: 'var(--accent)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {member.role}
      </p>

      {/* Contact */}
      <ul className="space-y-2.5">
        <li>
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-2.5 hover:opacity-60 transition-opacity"
            style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
          >
            <Mail size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            {member.email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${member.phone}`}
            className="flex items-center gap-2.5 hover:opacity-60 transition-opacity"
            style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
          >
            <Phone size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            {member.phone}
          </a>
        </li>
        <li>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 hover:opacity-60 transition-opacity"
            style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
          >
            <Linkedin size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            LinkedIn
          </a>
        </li>
      </ul>

    </div>
  )
}

export default function TeamPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-8 md:px-16 py-16 md:py-24">
      <SEO title="Our Team" path="/team" />

      {/* ── Hero ── */}
      <div className="mb-16">
        <span
          className="block mb-4"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}
        >
          The Team
        </span>
        <h1
          className="font-display font-black mb-5"
          style={{
            fontSize: 'clamp(36px, 5vw, 60px)',
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          The people behind{' '}
          <span style={{ color: 'var(--accent)' }}>Mango People.</span>
        </h1>
        <p
          style={{
            fontSize: '17px',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
            maxWidth: '52ch',
          }}
        >
          A small team of students building the news platform they always
          wanted to read — honest, clear, and written for the aam aadmi.
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="mb-16" style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── 3-column grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-16 mb-20">
        {team.map(member => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>

      {/* ── Footer ── */}
      <div
        className="pt-10 flex flex-wrap gap-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Link
          to="/contact"
          className="btn-accent text-sm h-10 px-5 inline-flex items-center gap-2"
        >
          Get in touch <ArrowRight size={14} />
        </Link>
        <Link
          to="/about"
          className="btn-ghost text-sm h-10 px-5 inline-flex items-center gap-2"
        >
          About us
        </Link>
      </div>

    </main>
  )
}