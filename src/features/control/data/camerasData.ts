import { ImageSourcePropType } from 'react-native';

/** Camera data structure */
export interface CameraData {
    id: string;
    pondName: string;
    cameraName: string;
    thumbnail: ImageSourcePropType;
    /** Mock video URL for demo */
    videoUrl: string;
    isOnline: boolean;
}

/** Mock camera data for demonstration */
export const MOCK_CAMERAS: CameraData[] = [
    {
        id: 'cam-1',
        pondName: 'Ao N06',
        cameraName: 'Camera 01',
        thumbnail: require('@/assets/images/thumbnail_1.png'),
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isOnline: true,
    },
    {
        id: 'cam-2',
        pondName: 'Ao N06',
        cameraName: 'Camera 02',
        thumbnail: require('@/assets/images/thumbnail_2.png'),
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        isOnline: true,
    },
    {
        id: 'cam-3',
        pondName: 'Ao N09',
        cameraName: 'Camera 01',
        thumbnail: require('@/assets/images/thumbnail_3.png'),
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        isOnline: true,
    },
    {
        id: 'cam-4',
        pondName: 'Ao N09',
        cameraName: 'Camera 02',
        thumbnail: require('@/assets/images/thumbnail_1.png'),
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        isOnline: false,
    },
    {
        id: 'cam-5',
        pondName: 'Ao N10',
        cameraName: 'Camera 01',
        thumbnail: require('@/assets/images/thumbnail_2.png'),
        videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        isOnline: true,
    },
];
