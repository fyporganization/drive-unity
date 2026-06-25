'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Image,
  FileText,
  Sparkles,
  SlidersHorizontal,
  X,
  Eye,
  ExternalLink,
  Calendar,
  Hash,
  Filter,
  FileImage,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAISearch, type SearchResult } from '@/lib/api/queries/useAISearch';
import { useGoogleDriveStatus } from '@/app/(private)/hooks/useAuthStatus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

// ── Mock data ──────────────────────────────────────────────

const SUGGESTION_CHIPS = [
  'Team photos from Q4',
  'Architecture diagrams',
  'Budget spreadsheets 2024',
  'Onboarding documents',
  'Product screenshots',
  'Meeting notes with action items',
];

// ── Helpers ─────────────────────────────────────────────────

function getConfidence(
  score: number
): { label: string; color: string; bg: string } {
  if (score >= 0.85)
    return {
      label: 'High',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    };
  if (score >= 0.7)
    return {
      label: 'Medium',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    };
  return {
    label: 'Low',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  };
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const words = query.trim().split(/\s+/);
  const regex = new RegExp(
    `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/15 text-primary rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const chartConfig = {
  value: { label: 'Count' },
};

function buildChartData(results: SearchResult[]) {
  const high = results.filter((r) => r.relevance_score >= 0.85).length;
  const med = results.filter(
    (r) => r.relevance_score >= 0.7 && r.relevance_score < 0.85
  ).length;
  const low = results.filter((r) => r.relevance_score < 0.7).length;

  const confidenceData = [
    { name: 'High', value: high, fill: 'hsl(152, 60%, 42%)' },
    { name: 'Medium', value: med, fill: 'hsl(38, 80%, 55%)' },
    { name: 'Low', value: low, fill: 'hsl(0, 70%, 55%)' },
  ].filter((d) => d.value > 0);

  const typeCounts: Record<string, number> = {};
  const typeColors: Record<string, string> = {
    PDF: 'hsl(252, 85%, 60%)',
    Image: 'hsl(280, 70%, 55%)',
    Doc: 'hsl(210, 70%, 55%)',
    Spreadsheet: 'hsl(152, 60%, 42%)',
    Other: 'hsl(38, 80%, 55%)',
  };
  for (const r of results) {
    const mime = r.mimeType || '';
    let label = 'Other';
    if (mime.startsWith('image/')) label = 'Image';
    else if (mime.includes('pdf')) label = 'PDF';
    else if (mime.includes('word') || mime.includes('document'))
      label = 'Doc';
    else if (mime.includes('sheet') || mime.includes('excel'))
      label = 'Spreadsheet';
    typeCounts[label] = (typeCounts[label] || 0) + 1;
  }
  const fileTypeData = Object.entries(typeCounts).map(([name, value]) => ({
    name,
    value,
    fill: typeColors[name] || 'hsl(38, 80%, 55%)',
  }));

  const yearCounts: Record<string, number> = {};
  for (const r of results) {
    const year = r.created_time?.slice(0, 4) || 'Unknown';
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  const timelineData = Object.entries(yearCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }));

  return { confidenceData, fileTypeData, timelineData };
}

// ── Component ───────────────────────────────────────────────

export const SearchContent = () => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'images' | 'documents'>(
    'documents'
  );
  const [minRelevance, setMinRelevance] = useState([0.5]);
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [captionFilter, setCaptionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [createdYear, setCreatedYear] = useState('all');
  const [extractionMethod, setExtractionMethod] = useState('all');

  const {
    results: rawResults,
    isSearching,
    error: searchError,
    hasSearched,
    keywords: searchKeywords,
    search,
    reset: resetSearch,
  } = useAISearch();

  const { accounts } = useGoogleDriveStatus();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId('all');
    }
  }, [accounts, selectedAccountId]);

  const accountEmailMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const acc of accounts) {
      map[acc.id] = acc.gmailAccount;
    }
    return map;
  }, [accounts]);

  const results = useMemo(() => {
    let filtered = rawResults.filter(
      (r) => r.relevance_score >= minRelevance[0]
    );

    if (confidenceFilter !== 'all') {
      filtered = filtered.filter((r) => {
        const c = getConfidence(r.relevance_score).label.toLowerCase();
        return c === confidenceFilter;
      });
    }

    if (captionFilter.trim()) {
      filtered = filtered.filter((r) =>
        (r.caption || r.text_preview || '')
          .toLowerCase()
          .includes(captionFilter.toLowerCase())
      );
    }

    if (createdYear !== 'all') {
      filtered = filtered.filter((r) =>
        r.created_time.startsWith(createdYear)
      );
    }

    if (extractionMethod !== 'all') {
      filtered = filtered.filter(
        (r) => r.extraction_method === extractionMethod
      );
    }

    if (sortBy === 'relevance')
      filtered.sort((a, b) => b.relevance_score - a.relevance_score);
    else if (sortBy === 'recent')
      filtered.sort(
        (a, b) =>
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime()
      );

    return filtered;
  }, [
    rawResults,
    minRelevance,
    confidenceFilter,
    sortBy,
    captionFilter,
    createdYear,
    extractionMethod,
  ]);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery ?? query;
    if (q.trim()) {
      const accountIds =
        !selectedAccountId || selectedAccountId === 'all'
          ? accounts.map((a) => a.id)
          : [selectedAccountId];

      if (accountIds.length === 0) return;

      search({
        query: q,
        searchMode,
        accountIds,
        limit: 20,
      });
    }
  };

  const chartData = useMemo(
    () => buildChartData(results),
    [results]
  );

  const insights = useMemo(() => {
    if (!hasSearched) return null;
    const high = results.filter((r) => r.relevance_score >= 0.85).length;
    const med = results.filter(
      (r) => r.relevance_score >= 0.7 && r.relevance_score < 0.85
    ).length;
    const low = results.filter((r) => r.relevance_score < 0.7).length;
    const topScore =
      results.length > 0
        ? Math.max(...results.map((r) => r.relevance_score))
        : 0;
    return { total: results.length, high, med, low, topScore, keywords: searchKeywords };
  }, [hasSearched, results, searchKeywords]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
    >
      {/* ── Page Header ─────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">
            AI Search
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Semantic search powered by AI — find files by meaning, not just
          keywords.
        </p>
      </div>

      {/* ── Search Bar ──────────────────────────────── */}
      <Card className="rounded-2xl shadow-soft border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask AI to find anything in your Drive…"
                className="pl-12 h-12 text-base rounded-xl border-border/60 bg-muted/30 focus:bg-card transition-colors"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    resetSearch();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="h-12 px-6 rounded-xl bg-gradient-cta text-primary-foreground font-medium"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSearchMode('images')}
                className={`flex items-center gap-2 text-sm font-medium pb-1 border-b-2 transition-colors ${
                  searchMode === 'images'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Image className="w-4 h-4" />
                Visual Search
              </button>
              <button
                onClick={() => setSearchMode('documents')}
                className={`flex items-center gap-2 text-sm font-medium pb-1 border-b-2 transition-colors ${
                  searchMode === 'documents'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4" />
                Document Intelligence
              </button>
            </div>
            <div className="flex items-center gap-2">
              {accounts.length > 1 && (
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs w-[220px]">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All accounts ({accounts.length})
                    </SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.gmailAccount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-muted-foreground"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                Filters
              </Button>
            </div>
          </div>

          {/* Suggestion chips */}
          {!hasSearched && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setQuery(chip);
                    handleSearch(chip);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── After Search Content ────────────────────── */}
      <AnimatePresence>
        {(hasSearched || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Loading state */}
            {isSearching && (
              <Card className="rounded-2xl shadow-soft border-border/60">
                <CardContent className="py-16 flex flex-col items-center text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="font-medium text-foreground">
                    Searching with AI…
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyzing your files semantically
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Error state */}
            {searchError && !isSearching && (
              <Card className="rounded-2xl shadow-soft border-destructive/30">
                <CardContent className="py-8 flex flex-col items-center text-center">
                  <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                  <p className="font-medium text-foreground">
                    Search failed
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchError}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* AI Insights Panel */}
            {insights && !isSearching && !searchError && (
              <Card className="rounded-2xl shadow-soft border-border/60 overflow-hidden">
                <div className="h-[3px] bg-gradient-cta" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      AI Insights
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <InsightStat
                      label="Results"
                      value={insights.total.toString()}
                    />
                    <InsightStat
                      label="High confidence"
                      value={insights.high.toString()}
                      color="text-emerald-600"
                    />
                    <InsightStat
                      label="Medium"
                      value={insights.med.toString()}
                      color="text-amber-600"
                    />
                    <InsightStat
                      label="Low"
                      value={insights.low.toString()}
                      color="text-red-500"
                    />
                    <InsightStat
                      label="Top relevance"
                      value={`${(insights.topScore * 100).toFixed(0)}%`}
                      color="text-primary"
                    />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Keywords
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {insights.keywords.map((k) => (
                          <Badge
                            key={k}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-normal"
                          >
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main content area */}
            <div className="flex gap-6">
              {/* Filters sidebar */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 260 }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 hidden lg:block overflow-hidden"
                  >
                    <Card className="rounded-2xl shadow-soft border-border/60 sticky top-24">
                      <CardHeader className="pb-3 pt-5 px-5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Filter className="w-4 h-4 text-primary" />
                          AI Filters
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-5 space-y-5">
                        {/* Confidence */}
                        <FilterSection label="Confidence level">
                          <Select
                            value={confidenceFilter}
                            onValueChange={setConfidenceFilter}
                          >
                            <SelectTrigger className="h-9 rounded-lg text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All levels
                              </SelectItem>
                              <SelectItem value="high">
                                High (&ge;85%)
                              </SelectItem>
                              <SelectItem value="medium">
                                Medium (70–84%)
                              </SelectItem>
                              <SelectItem value="low">
                                Low (&lt;70%)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FilterSection>

                        {/* Relevance slider */}
                        <FilterSection
                          label={`Min relevance: ${(minRelevance[0] * 100).toFixed(0)}%`}
                        >
                          <Slider
                            value={minRelevance}
                            onValueChange={setMinRelevance}
                            min={0}
                            max={1}
                            step={0.05}
                            className="py-2"
                          />
                        </FilterSection>

                        {/* Caption / text contains */}
                        <FilterSection
                          label={
                            searchMode === 'images'
                              ? 'Caption contains'
                              : 'Text contains'
                          }
                        >
                          <Input
                            value={captionFilter}
                            onChange={(e) =>
                              setCaptionFilter(e.target.value)
                            }
                            placeholder="Filter by content…"
                            className="h-9 rounded-lg text-sm"
                          />
                        </FilterSection>

                        {/* Extraction method (docs only) */}
                        {searchMode === 'documents' && (
                          <FilterSection label="Extraction method">
                            <Select
                              value={extractionMethod}
                              onValueChange={setExtractionMethod}
                            >
                              <SelectTrigger className="h-9 rounded-lg text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All methods
                                </SelectItem>
                                <SelectItem value="OCR + NLP">
                                  OCR + NLP
                                </SelectItem>
                                <SelectItem value="Direct Parse">
                                  Direct Parse
                                </SelectItem>
                                <SelectItem value="Table Extraction">
                                  Table Extraction
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FilterSection>
                        )}

                        {/* Created year */}
                        <FilterSection label="Created year">
                          <Select
                            value={createdYear}
                            onValueChange={setCreatedYear}
                          >
                            <SelectTrigger className="h-9 rounded-lg text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All years
                              </SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                              <SelectItem value="2024">2024</SelectItem>
                            </SelectContent>
                          </Select>
                        </FilterSection>

                        <Separator />

                        {/* Sort */}
                        <FilterSection label="Sort by">
                          <Select
                            value={sortBy}
                            onValueChange={setSortBy}
                          >
                            <SelectTrigger className="h-9 rounded-lg text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="relevance">
                                Highest relevance
                              </SelectItem>
                              <SelectItem value="recent">
                                Most recent
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FilterSection>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground text-xs"
                          onClick={() => {
                            setMinRelevance([0.5]);
                            setConfidenceFilter('all');
                            setCaptionFilter('');
                            setCreatedYear('all');
                            setExtractionMethod('all');
                            setSortBy('relevance');
                          }}
                        >
                          Reset filters
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {results.length} result
                    {results.length !== 1 ? 's' : ''} for &ldquo;
                    <span className="text-foreground font-medium">
                      {query}
                    </span>
                    &rdquo;
                  </p>
                </div>

                {results.length === 0 ? (
                  <Card className="rounded-2xl shadow-soft border-border/60">
                    <CardContent className="py-16 flex flex-col items-center text-center">
                      <Search className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="font-medium text-foreground">
                        No results found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your filters or search query.
                      </p>
                    </CardContent>
                  </Card>
                ) : searchMode === 'images' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {results.map((r, i) => (
                      <ImageResultCard
                        key={r.id}
                        result={r}
                        query={query}
                        index={i}
                        accountEmail={
                          accounts.length > 1 && r.google_drive_account_id
                            ? accountEmailMap[r.google_drive_account_id]
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((r, i) => (
                      <DocResultCard
                        key={r.id}
                        result={r}
                        query={query}
                        index={i}
                        accountEmail={
                          accounts.length > 1 && r.google_drive_account_id
                            ? accountEmailMap[r.google_drive_account_id]
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MiniChart
                title="Confidence Distribution"
                data={chartData.confidenceData}
                type="pie"
              />
              <MiniChart
                title="File Types"
                data={chartData.fileTypeData}
                type="pie"
              />
              <MiniChart
                title="Timeline"
                data={chartData.timelineData}
                type="bar"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when no search yet */}
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-1">
            Search your Drive with AI
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Use natural language to find images by visual content or
            documents by meaning — not just filenames.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// ── Sub-components ──────────────────────────────────────────

function InsightStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-xl font-bold font-display ${color || 'text-foreground'}`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function ImageResultCard({
  result,
  query,
  index,
  accountEmail,
}: {
  result: SearchResult;
  query: string;
  index: number;
  accountEmail?: string;
}) {
  const conf = getConfidence(result.relevance_score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="rounded-2xl shadow-soft border-border/60 overflow-hidden group hover:shadow-elevated transition-shadow duration-200">
        {/* Thumbnail placeholder */}
        <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center">
          <FileImage className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground truncate flex-1">
              {result.name}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${conf.bg} ${conf.color} border`}
            >
              {conf.label}
            </Badge>
          </div>
          {accountEmail && (
            <Badge
              variant="secondary"
              className="text-[10px] font-normal max-w-full truncate"
              title={accountEmail}
            >
              {accountEmail}
            </Badge>
          )}
          {result.caption && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {highlightText(result.caption, query)}
            </p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">
              {result.path}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={!result.web_view_link}
                onClick={() =>
                  result.web_view_link &&
                  window.open(result.web_view_link, '_blank', 'noopener,noreferrer')
                }
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={!result.web_view_link}
                onClick={() =>
                  result.web_view_link &&
                  window.open(result.web_view_link, '_blank', 'noopener,noreferrer')
                }
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DocResultCard({
  result,
  query,
  index,
  accountEmail,
}: {
  result: SearchResult;
  query: string;
  index: number;
  accountEmail?: string;
}) {
  const conf = getConfidence(result.relevance_score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="rounded-2xl shadow-soft border-border/60 hover:shadow-elevated transition-shadow duration-200">
        <CardContent className="p-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-foreground truncate">
                {result.name}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 ${conf.bg} ${conf.color} border`}
              >
                {conf.label}
              </Badge>
              {result.extraction_method && (
                <Badge
                  variant="secondary"
                  className="text-[10px] shrink-0 font-normal"
                >
                  {result.extraction_method}
                </Badge>
              )}
              {accountEmail && (
                <Badge
                  variant="secondary"
                  className="text-[10px] shrink-0 font-normal max-w-[180px] truncate"
                  title={accountEmail}
                >
                  {accountEmail}
                </Badge>
              )}
            </div>
            {result.text_preview && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {highlightText(result.text_preview, query)}
              </p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {result.word_count?.toLocaleString()} words
              </span>
              {result.page_count && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {result.page_count} pages
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(result.created_time).toLocaleDateString()}
              </span>
              <span>{result.path}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 self-center h-8 w-8"
            disabled={!result.web_view_link}
            onClick={() =>
              result.web_view_link &&
              window.open(result.web_view_link, '_blank', 'noopener,noreferrer')
            }
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MiniChart({
  title,
  data,
  type,
}: {
  title: string;
  data: any[];
  type: 'pie' | 'bar';
}) {
  return (
    <Card className="rounded-2xl shadow-soft border-border/60">
      <CardContent className="p-5">
        <p className="text-xs font-semibold text-foreground mb-3">
          {title}
        </p>
        <div className="h-32">
          <ChartContainer config={chartConfig} className="h-full w-full">
            {type === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  innerRadius={28}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {data.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </PieChart>
            ) : (
              <BarChart data={data}>
                <XAxis
                  dataKey={
                    data[0]?.year !== undefined ? 'year' : 'name'
                  }
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar
                  dataKey="count"
                  fill="hsl(252, 85%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </BarChart>
            )}
          </ChartContainer>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {type === 'pie' &&
            data.map((d: any) => (
              <span
                key={d.name}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: d.fill }}
                />
                {d.name}
              </span>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
