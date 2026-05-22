import defaultCourseCover from '../components/home/pictures/istockphoto-1980276924-612x612.jpg';

export const DEFAULT_COURSE_COVER = defaultCourseCover;

export function getCourseCoverUrl(imageUrl: string | null | undefined): string {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  return DEFAULT_COURSE_COVER;
}
