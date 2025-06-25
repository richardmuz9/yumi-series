import type { AxiosResponse } from 'axios';

export interface AIResponse {
  output: {
    text: string;
  };
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface CopyleaksSubmitResponse {
  data: {
    text: {
      id: string;
      status: string;
    };
  };
}

export interface CopyleaksStatusResponse {
  data: {
    text: {
      id: string;
      status: string;
    };
  };
}

export interface CopyleaksReportResponse {
  data: {
    text: {
      id: string;
      status: string;
      report: {
        results: Array<{
          similarity: number;
          url: string;
          title: string;
        }>;
      };
    };
  };
}

export interface CrossrefResponse {
  message: {
    items: Array<{
      title: string[];
      author: Array<{
        given: string;
        family: string;
      }>;
      'container-title': string[];
      published: {
        'date-parts': number[][];
      };
      DOI: string;
      URL: string;
    }>;
  };
}

export type APIResponse<T> = Promise<AxiosResponse<T>>; 