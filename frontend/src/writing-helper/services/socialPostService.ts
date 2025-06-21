interface PostResult {
  success: boolean;
  message?: string;
  url?: string;
}

interface PostContent {
  text: string;
  images?: string[];
}

class SocialPostService {
  private async shareViaWebAPI(content: PostContent, title: string): Promise<boolean> {
    if (!navigator.share) return false;

    try {
      let files: File[] | undefined;
      
      if (content.images?.length) {
        files = await Promise.all(
          content.images.map(url => this.urlToFile(url))
        );
      }

      if (navigator.canShare({ text: content.text, title, files })) {
        await navigator.share({ text: content.text, title, files });
        return true;
      }
    } catch (e) {
      console.warn('Share cancelled or failed:', e);
    }
    return false;
  }

  private async urlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  }

  private async postToX(content: PostContent): Promise<PostResult> {
    // X/Twitter doesn't support direct image upload via URL
    // We'll just post the text and let users add images manually
    const encodedText = encodeURIComponent(content.text);
    const tweetIntent = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    try {
      window.open(tweetIntent, '_blank');
      return {
        success: true,
        url: tweetIntent,
        message: content.images ? 'Please add your images after the tweet window opens.' : undefined
      };
    } catch (e) {
      console.error('Failed to open X/Twitter:', e);
      return {
        success: false,
        message: 'Failed to open X/Twitter. Please try again.'
      };
    }
  }

  private async postToRednote(content: PostContent): Promise<PostResult> {
    if (!content.images?.length) {
      return {
        success: false,
        message: '小红书 requires at least one image for posting.'
      };
    }

    // Try web share API first
    const shared = await this.shareViaWebAPI(content, '小红书分享');
    if (shared) {
      return {
        success: true,
        message: 'Content shared via system share dialog'
      };
    }

    // Fallback: Open Rednote and provide copy prompt
    try {
      window.open('https://www.xiaohongshu.com/publish', '_blank');
      
      // Create a temporary textarea for copying
      const textarea = document.createElement('textarea');
      textarea.value = content.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      // Store images in localStorage for the extension to pick up
      localStorage.setItem('rednote_pending_images', JSON.stringify(content.images));

      return {
        success: true,
        message: 'Content copied to clipboard. Please paste in Rednote and add the saved images.'
      };
    } catch (e) {
      console.error('Failed to handle Rednote post:', e);
      return {
        success: false,
        message: 'Failed to prepare content for Rednote. Please try again.'
      };
    }
  }

  private async postToInstagram(content: PostContent): Promise<PostResult> {
    const shared = await this.shareViaWebAPI(content, 'Instagram Post');
    if (shared) {
      return {
        success: true,
        message: 'Content shared via system share dialog'
      };
    }

    // Fallback: Copy to clipboard and open Instagram
    try {
      const textarea = document.createElement('textarea');
      textarea.value = content.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      // Store images in localStorage for the extension to pick up
      if (content.images?.length) {
        localStorage.setItem('instagram_pending_images', JSON.stringify(content.images));
      }

      window.open('https://www.instagram.com/create/story', '_blank');

      return {
        success: true,
        message: 'Content copied to clipboard. Please paste in Instagram and add the saved images.'
      };
    } catch (e) {
      return {
        success: false,
        message: 'Failed to prepare content for Instagram. Please try again.'
      };
    }
  }

  private async postToFacebook(content: PostContent): Promise<PostResult> {
    const encodedText = encodeURIComponent(content.text);
    const fbIntent = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodedText}`;

    try {
      window.open(fbIntent, '_blank');
      return {
        success: true,
        url: fbIntent,
        message: content.images ? 'Please add your images after the Facebook window opens.' : undefined
      };
    } catch (e) {
      console.error('Failed to open Facebook:', e);
      return {
        success: false,
        message: 'Failed to open Facebook. Please try again.'
      };
    }
  }

  async post(platform: string, content: PostContent): Promise<PostResult> {
    switch (platform) {
      case 'x':
        return this.postToX(content);
      case 'red':
        return this.postToRednote(content);
      case 'instagram':
        return this.postToInstagram(content);
      case 'facebook':
        return this.postToFacebook(content);
      default:
        return {
          success: false,
          message: `Unsupported platform: ${platform}`
        };
    }
  }
}

export const socialPostService = new SocialPostService(); 