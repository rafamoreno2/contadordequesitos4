'use client';

import QuesitosMap from './quesitos-map';
import type { Quesito } from '@/types';

// This is a new wrapper component to ensure the map is only rendered on the client side
// and isolated from server-side rendering and hot-reloading issues.
export default function MapWrapper({ quesitos }: { quesitos: Quesito[] }) {
    return <QuesitosMap quesitos={quesitos} />;
}
