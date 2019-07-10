import { environment } from 'environment';
import SSC from 'sscjs';

export const ssc = new SSC(environment.RPC_URL);
