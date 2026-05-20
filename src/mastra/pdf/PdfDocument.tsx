import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { marked, type Token, type Tokens } from 'marked';

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    color: '#17324d',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#00396e',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stripeBlue: {
    width: 5,
    height: 22,
    backgroundColor: '#00396e',
    marginRight: 4,
  },
  stripeRed: {
    width: 5,
    height: 22,
    backgroundColor: '#b20000',
    marginRight: 8,
  },
  brand: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#00396e',
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 7,
    color: '#5c6f82',
    letterSpacing: 1,
    marginTop: 2,
  },
  metaBlock: {
    fontSize: 8.5,
    color: '#5c6f82',
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0a1f33',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: '#5c6f82',
    marginBottom: 24,
  },
  h1: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#00396e',
    marginTop: 16,
    marginBottom: 8,
  },
  h2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#00396e',
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: '#17324d',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10.5,
    color: '#17324d',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique' },
  listItem: { flexDirection: 'row', marginBottom: 3, paddingLeft: 8 },
  listBullet: { width: 12, fontSize: 10.5, color: '#0066CC' },
  listText: { flex: 1, fontSize: 10.5 },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e6ecf2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e6ecf2' },
  tableRowLast: { flexDirection: 'row' },
  tableHeader: {
    backgroundColor: '#ebf2fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e6ecf2',
  },
  tableCell: { flex: 1, padding: 8, fontSize: 9.5 },
  tableCellHeader: {
    flex: 1,
    padding: 8,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#00396e',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e6ecf2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#a5adba',
  },
  hr: { borderTopWidth: 1, borderTopColor: '#e6ecf2', marginVertical: 10 },
});

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) parts.push(<Text key={key++} style={styles.bold}>{match[2]}</Text>);
    else if (match[3]) parts.push(<Text key={key++} style={styles.italic}>{match[3]}</Text>);
    else if (match[4]) parts.push(<Text key={key++} style={styles.italic}>{match[4]}</Text>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

function renderToken(token: Token, key: number): React.ReactNode {
  switch (token.type) {
    case 'heading': {
      const t = token as Tokens.Heading;
      const style = t.depth === 1 ? styles.h1 : t.depth === 2 ? styles.h2 : styles.h3;
      return <Text key={key} style={style}>{renderInline(t.text)}</Text>;
    }
    case 'paragraph': {
      const t = token as Tokens.Paragraph;
      return <Text key={key} style={styles.paragraph}>{renderInline(t.text)}</Text>;
    }
    case 'list': {
      const t = token as Tokens.List;
      return (
        <View key={key} style={{ marginBottom: 8 }}>
          {t.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>{t.ordered ? `${i + 1}.` : '•'}</Text>
              <Text style={styles.listText}>{renderInline(item.text)}</Text>
            </View>
          ))}
        </View>
      );
    }
    case 'table': {
      const t = token as Tokens.Table;
      return (
        <View key={key} style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {t.header.map((cell, i) => (
              <Text key={i} style={styles.tableCellHeader}>{cell.text}</Text>
            ))}
          </View>
          {t.rows.map((row, ri) => {
            const isLast = ri === t.rows.length - 1;
            return (
              <View key={ri} style={isLast ? styles.tableRowLast : styles.tableRow}>
                {row.map((cell, ci) => (
                  <Text key={ci} style={styles.tableCell}>{renderInline(cell.text)}</Text>
                ))}
              </View>
            );
          })}
        </View>
      );
    }
    case 'hr':
      return <View key={key} style={styles.hr} />;
    case 'space':
      return <View key={key} style={{ height: 6 }} />;
    case 'blockquote': {
      const t = token as Tokens.Blockquote;
      return (
        <View key={key} style={{ borderLeftWidth: 3, borderLeftColor: '#0066CC', paddingLeft: 10, marginVertical: 8 }}>
          {t.tokens?.map((tok, i) => renderToken(tok, i))}
        </View>
      );
    }
    default:
      if ('text' in token && typeof token.text === 'string') {
        return <Text key={key} style={styles.paragraph}>{token.text}</Text>;
      }
      return null;
  }
}

interface PdfDocumentProps {
  title: string;
  subtitle?: string;
  contentMarkdown: string;
  meta?: { label: string; value: string }[];
}

export function PdfDocument({ title, subtitle, contentMarkdown, meta }: PdfDocumentProps) {
  const tokens = marked.lexer(contentMarkdown);
  const today = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.brandBlock}>
            <View style={styles.stripeBlue} />
            <View style={styles.stripeRed} />
            <View>
              <Text style={styles.brand}>PDMD-TA</Text>
              <Text style={styles.tagline}>COMUNE DI TARANTO</Text>
            </View>
          </View>
          <View style={styles.metaBlock}>
            <Text>{today}</Text>
            {meta?.map((m, i) => (
              <Text key={i}>{m.label}: {m.value}</Text>
            ))}
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {tokens.map((token, i) => renderToken(token, i))}

        <View style={styles.footer} fixed>
          <Text>PDMD-TA - Documento generato automaticamente</Text>
          <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} di ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
