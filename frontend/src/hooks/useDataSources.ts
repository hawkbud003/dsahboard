import React, { useState, useEffect } from 'react';
import { Auth, User } from '../types/auth';
import { CommonSelectResponse, DataSources, Interest, Location } from '../types/campaign';
import { campaignClient } from '@/lib/campaign-client';
import { Creative } from '@/types/creative';
import { creativeClient } from '@/lib/creative.client';

export const useDataSources = (auth: Auth | null) => {
    const [dataSources, setDataSources] = React.useState<DataSources>({
        ages: [] as CommonSelectResponse[],
        devices: [] as CommonSelectResponse[],
        environment: [] as CommonSelectResponse[],
        location: [] as Location[],
        exchange: [] as CommonSelectResponse[],
        language: [] as CommonSelectResponse[],
        carrier: [] as CommonSelectResponse[],
        device_price: [] as CommonSelectResponse[],
        interest_category: [] as CommonSelectResponse[],
        interest: [] as Interest[],
        selectedInterest: [] as Interest[],
        buy_type: [] as CommonSelectResponse[],
        brand_safety: [] as CommonSelectResponse[],
        viewability: [] as CommonSelectResponse[],
        users: [] as User[],
        creatives: [] as Creative[]
      });
      const [impressionData, setImpressionData] = useState<any>(null);
      const [totalPopulation, setTotalPopulation] = useState<number>(0);
    
    const fetchData = async () => {
        try {
            const [ageRes, deviceRes, envRes, locRes,exchangeRes,langRes,
                carrierRes,devicePriceRes, categoryInterestRes,interestRes, impressionRes,buyTypeRes,
                viewabilityRes,brandSafetyRes,userRes,creativeRes] = await Promise.all([
                campaignClient.getAge(),
                campaignClient.getDevice(),
                campaignClient.getEnv(),
                campaignClient.getLocations(),
                campaignClient.getExchange(),
                campaignClient.getLanguage(),
                campaignClient.getCarrier(),
                campaignClient.getDevicePrice(),
                campaignClient.getDistinctInterest(),
                campaignClient.getInterest(""),
                campaignClient.getImpressionData(),
                campaignClient.getBuyType(),
                campaignClient.getViewability(),
                campaignClient.getBrandSafety(),
                campaignClient.getUsers(auth?.usertype === 'admin'),
                creativeClient.getAllCreatives()
            ]);
            setDataSources({
                ages: ageRes,
                devices: deviceRes,
                environment: envRes,
                location: locRes,
                exchange: exchangeRes,
                language: langRes,
                carrier: carrierRes,
                device_price: devicePriceRes,
                interest_category: categoryInterestRes,
                interest: interestRes,
                selectedInterest: [],
                buy_type:buyTypeRes,
                viewability:viewabilityRes,
                brand_safety:brandSafetyRes,
                users:userRes,
                creatives:creativeRes
            });
            setImpressionData(impressionRes);
            setTotalPopulation(impressionRes.totalPopulation);
        } catch (error) {
            console.error('Error fetching data sources:', error);
        }
    };

    useEffect(() => {
        if (auth?.token) {
            fetchData();
        }
    }, [auth?.token]);

    return { dataSources, impressionData, totalPopulation,fetchData };
}; 