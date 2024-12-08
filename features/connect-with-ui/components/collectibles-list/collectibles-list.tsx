import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NftOrdering, Alchemy, NftFilters } from 'alchemy-sdk';
import NftNoImage from '~/shared/svg/nft/nft-no-image.svg';
import NftNoImageDark from '~/shared/svg/nft/nft-no-image-dark.svg';
import styles from './collectibles-list.less';
import { EmptyCollectiblesList } from './empty-collectibles-list';
import { store } from '~/app/store';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { getNftImage } from '~/features/connect-with-ui/utils/get-nft-image';
import { useAlchemyInstance } from '~/features/connect-with-ui/hooks/useAlchemyInstance';
import { getNftAltTag } from '~/features/connect-with-ui/utils/get-nft-alt-tag';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { CountBadge } from '~/features/native-methods/pages/nft-transfer/components/CountBadge';
import { motion } from 'framer-motion';
import { Icon, Flex, Spacer } from '@magiclabs/ui';
import { AngleDown } from '~/shared/svg/magic-connect';
import { useCollectiableDetailsState } from '~/features/native-methods/hooks/use-collectiable-details-state';
import { Animate } from '~/features/native-methods/components/animate/animate';

const getNftsForOwner = async (address: string, alchemy: Alchemy | undefined, spam = false) =>
  alchemy?.nft.getNftsForOwner(address, {
    orderBy: NftOrdering.TRANSFERTIME,
    ...(spam && { includeFilters: [NftFilters.SPAM] }),
    ...(!spam && { excludeFilters: [NftFilters.SPAM] }),
  });

export const CollectiblesList: React.FC<{ noPadding?: boolean }> = ({ noPadding = false }) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const alchemy = useAlchemyInstance(MultiChainInfoContext);
  const address = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress) as string;
  const { filterSpam } = store.hooks.useSelector(state => state.User);
  const { setCollectiableDetailsState } = useCollectiableDetailsState();

  const {
    data: collectiblesListData,
    isError,
    isLoading,
  } = useQuery([address, 'nospam'], () => getNftsForOwner(address, alchemy, false), {
    enabled: Boolean(alchemy),
    cacheTime: 0,
  });

  const {
    data: collectiblesListDataSpam,
    isError: isErrorSpam,
    isLoading: isLoadingSpam,
  } = useQuery([address, 'spam'], () => getNftsForOwner(address, alchemy, true), {
    enabled: Boolean(alchemy),
    cacheTime: 0,
  });

  const goToNftDetailsPage = (contractAddress: string, tokenId: string) => {
    setCollectiableDetailsState({
      contractAddress,
      tokenId,
    });

    navigateTo('collectible-details', eventData);
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(prevValue => !prevValue);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className={styles.collectiblesList} style={{ padding: noPadding ? '0' : '0 8px' }}>
        {(!collectiblesListData || collectiblesListData.ownedNfts.length < 1 || isError) && <EmptyCollectiblesList />}
        {collectiblesListData?.ownedNfts?.map(collectible => (
          <button
            className={styles.collectible}
            key={`${collectible.contract.address}/${collectible.tokenId}`}
            onClick={() => goToNftDetailsPage(collectible.contract.address, collectible.tokenId)}
          >
            <img
              alt={getNftAltTag(collectible)}
              className={styles.collectibleImg}
              src={getNftImage(collectible.image.cachedUrl ?? collectible.image.originalUrl)} // old image URL that had caching issues: collectible.rawMetadata?.image
              onError={({ currentTarget }) => {
                if (theme.isDarkTheme) {
                  currentTarget.src = NftNoImageDark;
                  return;
                }
                currentTarget.src = NftNoImage;
              }}
            />
            {Number(collectible.balance) > 1 && (
              <CountBadge
                count={Number(collectible.balance)}
                color="white"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: '16',
                  background: 'rgba(25, 25, 25, 0.40)',
                  border: 'none',
                }}
              />
            )}
          </button>
        ))}
      </div>
      {collectiblesListDataSpam && collectiblesListDataSpam.ownedNfts.length > 0 && !isErrorSpam && !isLoadingSpam && (
        <div>
          <button className={styles.hiddenCollectibleDrawerButton} onClick={toggleDrawer}>
            <div className={styles.hiddenText}>Hidden ({collectiblesListDataSpam.totalCount})</div>
            <Flex.Row alignItems="center">
              <Spacer size={8} orientation="horizontal" />
              <Icon className={isDrawerOpen ? styles.openDrawerAngleIcon : ''} type={AngleDown} color="var(--ink50)" />
            </Flex.Row>
          </button>
          <Animate>
            {isDrawerOpen && (
              <motion.div
                animate={{ height: 'auto' }}
                className={styles.drawer}
                initial={{ height: 0 }}
                transition={{ duration: 0.3 }}
                exit={{ height: 0, transition: { duration: 0.3 } }}
              >
                <div className={styles.hiddenExplainerText}>
                  These collectibles come from unverified sources.
                  <br />
                  Proceed with caution.
                </div>
                <div className={styles.collectiblesList} style={{ padding: noPadding ? '0' : '0 8px' }}>
                  {collectiblesListDataSpam?.ownedNfts?.map(collectible => (
                    <button
                      className={styles.collectible}
                      key={`${collectible.contract.address}/${collectible.tokenId}`}
                      onClick={() => goToNftDetailsPage(collectible.contract.address, collectible.tokenId)}
                    >
                      <img
                        alt={getNftAltTag(collectible)}
                        className={styles.collectibleImg}
                        src={getNftImage(collectible.image.cachedUrl ?? collectible.image.originalUrl)} // old image URL that had caching issues: collectible.rawMetadata?.image
                        onError={({ currentTarget }) => {
                          if (theme.isDarkTheme) {
                            currentTarget.src = NftNoImageDark;
                            return;
                          }
                          currentTarget.src = NftNoImage;
                        }}
                      />
                      {Number(collectible.balance) > 1 && (
                        <CountBadge
                          count={Number(collectible.balance)}
                          color="white"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: '16',
                            background: 'rgba(25, 25, 25, 0.40)',
                            border: 'none',
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </Animate>
        </div>
      )}
    </div>
  );
};
