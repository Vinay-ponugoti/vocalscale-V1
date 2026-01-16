export interface Review {
  id: string;
  name: string;
  initials: string;
  color: string;
  rating: number;
  time: string;
  text: string;
  replied: boolean;
  critical?: boolean;
  source?: 'google_business' | 'google_places' | 'yelp' | 'tripadvisor';
  original_timestamp?: string;
}

export interface ReviewStats {
  overallRating: number;
  totalReviews: number;
  responseRate: number;
  avgResponseTime: number;
  reviewVolume: {
    day: string;
    reviews: number;
    positive: number;
    negative: number;
  }[];
  sentiment: {
    name: string;
    value: number;
    color: string;
  }[];
  ratingDistribution: {
    stars: number;
    count: number;
    percent: number;
  }[];
  trends: {
    rating: number;
    reviews: number;
    responseRate: number;
    responseTime: number;
  };
}

export interface AISummaryData {
  positives: string[];
  improvements: string[];
  lastUpdated: string;
}
