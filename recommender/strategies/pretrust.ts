import { db } from '../../server/db';
import { Follow, Pretrust, Profile } from '../../types'

export type PretrustPicker = (fid?: number) => Promise<Pretrust<number>>
export type PretrustStrategy = {picker: PretrustPicker, personalized: boolean}

const pretrustAllEqually: PretrustPicker = async () => {
	return [] as Pretrust<number>
}

const pretrustSpecificFids: PretrustPicker = async () => {
	const pretrustedFids = [1, 2]
	const pretrust: Pretrust<number> = []

	pretrustedFids.forEach((fid) => {
		pretrust.push({
			i: fid,
			v: 1 / pretrustedFids.length
		})
	})

	return pretrust
}

const pretrustFollowsOfFid: PretrustPicker = async (fid?: number) => {
	const pretrust: Pretrust<number> = []
	const follows = await db('follows')
		.where('followerFid', fid)
		.select()

	follows.forEach((follow: Follow) => {
		pretrust.push({
			i: follow.followingFid,
			v: 1 / follows.length
		})
	})

	return pretrust
}

const pretrustFirst20Profiles: PretrustPicker = async () => {
	const pretrust: Pretrust<number> = []
	const profiles = await db('profiles')
		.select('fid', 'registered_at')
		.orderBy('registered_at', 'asc')
		.limit(20)

	profiles.forEach((profile: Profile) => {
		pretrust.push({
			i: profile.fid,
			v: 1 / profiles.length
		})
	})

	return pretrust
}



export const strategies: Record<string, PretrustStrategy> = {
	pretrustAllEqually: { picker: pretrustAllEqually, personalized: false },
	pretrustSpecificFids: { picker: pretrustSpecificFids, personalized: false },
	pretrustFollowsOfFid: { picker: pretrustFollowsOfFid, personalized: true },
	pretrustFirst20Profiles: { picker: pretrustFirst20Profiles, personalized: false }
}
