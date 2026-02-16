import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/packages/uploadthing';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
