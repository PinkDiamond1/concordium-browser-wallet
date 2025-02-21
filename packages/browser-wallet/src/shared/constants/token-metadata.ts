import { TokenMetadata } from '@shared/storage/types';
import { getCcdSymbol } from 'wallet-common-helpers';

const CCD_IMAGE = {
    url: "data:image/svg+xml;charset=UTF-8,%3csvg viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M23.8461 17.8447H19.3916C20.5119 16.3777 21.2054 14.5372 21.2054 12.5366C21.2054 10.5361 20.5119 8.69558 19.3916 7.22852H23.8461C24.593 8.85562 25.0198 10.6428 25.0198 12.5366C25.0198 14.4305 24.6197 16.2176 23.8461 17.8447Z' fill='%23181817' /%3e%3cpath d='M12.5103 17.8184C15.4418 17.8184 17.8184 15.4418 17.8184 12.5103C17.8184 9.57867 15.4418 7.20215 12.5103 7.20215C9.57867 7.20215 7.20215 9.57867 7.20215 12.5103C7.20215 15.4418 9.57867 17.8184 12.5103 17.8184Z' fill='%23181817' /%3e%3cpath d='M3.81437 12.5367C3.81437 17.338 7.70876 21.2591 12.5101 21.2591C13.7904 21.2591 15.0174 20.9657 16.111 20.4589V24.54C14.9641 24.8868 13.7637 25.0735 12.5101 25.0735C5.60152 25.0735 0 19.4453 0 12.5367C0 5.60152 5.60152 0 12.5101 0C13.7637 0 14.9641 0.186717 16.111 0.533478V4.61459C15.0174 4.10778 13.7904 3.81437 12.5101 3.81437C7.70876 3.81437 3.81437 7.70876 3.81437 12.5367Z' fill='%23181817' /%3e%3c/svg%3e",
};
const WCCD_IMAGE = { url: 'https://developer.concordium.software/en/mainnet/_images/wCCD.svg' };

export const CCD_METADATA: TokenMetadata = {
    name: 'CCD',
    decimals: 6,
    symbol: getCcdSymbol(),
    display: CCD_IMAGE,
    thumbnail: CCD_IMAGE,
};

export const WCCD_METADATA: TokenMetadata = {
    name: 'Wrapped CCD Token',
    symbol: 'wCCD',
    decimals: 6,
    description: 'A CIS2 token wrapping the Concordium native token (CCD)',
    thumbnail: WCCD_IMAGE,
    display: WCCD_IMAGE,
    artifact: WCCD_IMAGE,
};
