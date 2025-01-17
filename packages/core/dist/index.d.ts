// Generated by dts-bundle-generator v9.5.1

import { z } from 'zod';

declare class KilpiInternalError extends Error {
	constructor(message: string, options?: {
		cause?: unknown;
	});
}
declare class KilpiPermissionDeniedError extends Error {
	constructor(message: string);
}
declare class KilpiInvalidSetupError extends Error {
	constructor(message: string);
}
declare class KilpiFetchPermissionFailedError extends Error {
	constructor(message: string);
}
declare class KilpiFetchSubjectFailedError extends Error {
	constructor(message: string);
}
/**
 * All Kilpi errors.
 */
export declare const KilpiError: {
	Internal: typeof KilpiInternalError;
	InvalidSetup: typeof KilpiInvalidSetupError;
	PermissionDenied: typeof KilpiPermissionDeniedError;
	FetchSubjectFailed: typeof KilpiFetchSubjectFailedError;
	FetchPermissionFailed: typeof KilpiFetchPermissionFailedError;
};
/**
 * Type of generic subject guard
 */
export type SubjectGuard<TSubject extends object | null | undefined, TSubjectGuarded extends object | null | undefined> = (subject: TSubject) => {
	subject: TSubjectGuarded;
} | null | undefined;
/**
 * Permission granted with refined subject included.
 */
export type PermissionGrant<TSubjectOut> = {
	granted: true;
	subject: TSubjectOut;
};
/**
 * Permission denied, no refined subject required.
 */
export type PermissionDeny = {
	granted: false;
	message?: string;
};
/**
 * Permission is either granted (with refined subject) or denied based on the discriminated
 * union by the `granted: boolean` key.
 */
export type Permission<TSubjectOut> = PermissionGrant<TSubjectOut> | PermissionDeny;
declare function Grant<TSubjectOut>(subject: TSubjectOut): PermissionGrant<TSubjectOut>;
declare function Deny(message?: string): PermissionDeny;
/**
 * Access permission functions via namespace.
 */
export declare const Permission: {
	Grant: typeof Grant;
	Deny: typeof Deny;
};
/**
 * Object with string keys to type T with any depth.
 */
export type DeepObject<T> = {
	[key: string]: T | DeepObject<T>;
};
/**
 * Extracts all keys from an object which have a value of type Target.
 */
export type RecursiveKeysTo<Object, Target, Separator extends string = "."> = Object extends object ? {
	[Key in keyof Object]: Key extends string | number ? Object[Key] extends Target ? Key : `${Key}${Separator}${RecursiveKeysTo<Object[Key], Target, Separator>}` : never;
}[keyof Object] : never;
/**
 * Extracts all values from an object which have a key of type Target.
 */
export type RecursiveValueByKey<Object, Key extends string, Separator extends string = "."> = Object extends object ? Key extends `${infer FirstKey}${Separator}${infer Rest}` ? FirstKey extends keyof Object ? RecursiveValueByKey<Object[FirstKey], Rest, Separator> : never : Key extends keyof Object ? Object[Key] : never : never;
/**
 * Value optionally wrapped in a promise.
 */
export type MaybePromise<T> = T | Promise<T>;
/**
 * A rule is a function that receives a subject and a resource and returns a permission with a
 * potentially narrowed subject.
 *
 * Additionally, the subject guard function is attached.
 */
export type Rule<TResource, TSubject extends object | null | undefined, TGuardedSubject extends object | null | undefined = TSubject> = ((subject: TSubject, resource: TResource) => Promise<Permission<TGuardedSubject>>) & {
	/**
	 * Subject guard
	 */
	guard: SubjectGuard<TSubject, TGuardedSubject>;
};
/**
 * Rule inferral utilities
 */
export type InferRule<T> = T extends Rule<infer TResource, infer TSubject, infer TGuardedSubject> ? {
	resource: TResource;
	subject: TSubject;
	guardedSubject: TGuardedSubject;
} : never;
export type InferRuleResource<T> = InferRule<T>["resource"];
export type InferRuleSubject<T> = InferRule<T>["subject"];
export type InferRuleGuardedSubject<T> = InferRule<T>["guardedSubject"];
/**
 * Create a rule with a nicer interface by providing the guard function and the check function
 * ran after the guard.
 */
export declare function createRule<TResource, TSubject extends object | null | undefined, TGuardedSubject extends object | null | undefined>(guard: SubjectGuard<TSubject, TGuardedSubject>, check: (subject: TGuardedSubject, resource: TResource) => MaybePromise<boolean | Permission<TGuardedSubject>>): Rule<TResource | TResource[], TSubject, TGuardedSubject>;
/**
 * Separator for rule keys.
 */
export declare const RULE_KEY_SEPARATOR: ":";
/**
 * Rule-set is a deep-object of rules which all share a common base subject type.
 */
export type Ruleset<TSubject extends object | null | undefined> = DeepObject<Rule<any, TSubject, any>>;
/**
 * List of all keys in ruleset.
 */
export type RulesetKeys<TRuleset extends Ruleset<any>> = RecursiveKeysTo<TRuleset, TRuleset extends Ruleset<infer TSubject> ? Rule<any, TSubject, any> : never, typeof RULE_KEY_SEPARATOR>;
/**
 * Key => Resource of a rule map
 */
export type RulesetResourceMap<TRuleset extends Ruleset<any>> = {
	[Key in RulesetKeys<TRuleset>]: InferRuleResource<GetRuleByKey<TRuleset, Key>>;
};
/**
 * Ensure a value is a rule
 */
export type EnsureTypeIsRule<T> = T extends Rule<any, any, any> ? T : never;
/**
 * Type of a rule from a ruleset given a key.
 */
export type GetRuleByKey<TRuleset extends Ruleset<any>, TKey extends RulesetKeys<TRuleset>> = EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey, typeof RULE_KEY_SEPARATOR>>;
/**
 * Get a rule from a ruleset given a key.
 */
export declare function getRuleByKey<const TRuleset extends Ruleset<any>, TKey extends RulesetKeys<TRuleset>>(ruleset: TRuleset, key: TKey): GetRuleByKey<TRuleset, TKey>;
export type KilpiConstructor<TSubject extends object | null | undefined> = {
	/**
	 * Create subject guard
	 */
	guard: <TGuardedSubject extends object | null | undefined>(guard: SubjectGuard<TSubject, TGuardedSubject>) => SubjectGuard<TSubject, TGuardedSubject> & {
		/**
		 * Create rule wth guard
		 */
		create: <TResource>(check: (subject: TGuardedSubject, resource: TResource) => MaybePromise<boolean | Permission<TGuardedSubject>>) => Rule<TResource | TResource[], TSubject, TGuardedSubject>;
	};
	/**
	 * Create Rule without guard (equal to creating with trivial guard)
	 */
	create: <TResource>(check: (subject: TSubject, resource: TResource) => MaybePromise<boolean | Permission<TSubject>>) => Rule<TResource | TResource[], TSubject, TSubject>;
};
/**
 * Handler when `protect()` denies access. Either a sync or async function that runs a side effect
 * on denial (e.g. a log) or throws an error or other throwable, e.g. a redirect.
 */
export type OnDenyHandler = (options: {
	message?: string;
	rule: Rule<any, any, any>;
	subject: unknown;
}) => void | never | Promise<void> | Promise<never>;
/**
 * Kilpi core class to encapsulate ruleset, guards, subjects and more.
 */
export declare class KilpiCore<TSubject extends object | null | undefined, TRuleset extends Ruleset<TSubject>, TGuards extends Record<string, SubjectGuard<TSubject, object | null | undefined>>> {
	/**
	 * Subject fetcher
	 */
	getSubject: () => TSubject | Promise<TSubject>;
	/**
	 * Ruleset from construction
	 */
	ruleset: TRuleset;
	/**
	 * All subject guard functions from construction
	 */
	guards: TGuards;
	/**
	 * Inferring utilities. Do not use in runtime.
	 */
	$$infer: {
		subject: TSubject;
		ruleset: TRuleset;
		guards: TGuards;
	};
	/**
	 * New instance
	 */
	constructor(getSubject: () => TSubject | Promise<TSubject>, construct: (constructor: KilpiConstructor<TSubject>) => {
		guards: TGuards;
		rules: TRuleset;
	});
	/**
	 * Get permission to a rule inside the ruleset
	 */
	getPermission<TKey extends RulesetKeys<TRuleset>>(key: TKey, resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>): Promise<Permission<InferRuleGuardedSubject<GetRuleByKey<TRuleset, TKey>>>>;
	/**
	 * Get permission to a rule inside the ruleset (only return boolean)
	 */
	hasPermission<TKey extends RulesetKeys<TRuleset>>(key: TKey, resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>): Promise<boolean>;
	/**
	 * Throw if no permission, else return guarded subject
	 */
	protect<TKey extends RulesetKeys<TRuleset>>(key: TKey, resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>, onDeny?: OnDenyHandler): Promise<InferRuleGuardedSubject<GetRuleByKey<TRuleset, TKey>>>;
	/**
	 * Expose guards via `guard.[guardKey]` syntax, similar to protect but without requiring a
	 * resource. E.g., `await KilpiCore.guard.authed()`.
	 */
	get guard(): TGuards;
	/**
	 * Create protected query
	 */
	createProtectedQuery<TQuery extends (...args: any[]) => Promise<any>>(query: TQuery, protector?: (result: Awaited<ReturnType<TQuery>>, ...args: Parameters<TQuery>) => Promise<any>): TQuery & {
		/**
		 * Return null if the authorization check fails
		 */
		safe(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>> | null>;
		/**
		 * Throw if authorization check fails
		 */
		protect(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>>;
	};
	/**
	 * Create endpoint handler
	 */
	createPostEndpoint(options: {
		secret: string;
	}): (request: Request) => Promise<Response>;
}
export declare const endpointRequestSchema: z.ZodDiscriminatedUnion<"action", [
	z.ZodObject<{
		action: z.ZodLiteral<"fetchSubject">;
	}, "strip", z.ZodTypeAny, {
		action: "fetchSubject";
	}, {
		action: "fetchSubject";
	}>,
	z.ZodObject<{
		action: z.ZodLiteral<"fetchPermissions">;
		rules: z.ZodArray<z.ZodObject<{
			key: z.ZodString;
			resource: z.ZodOptional<z.ZodAny>;
		}, "strip", z.ZodTypeAny, {
			key: string;
			resource?: any;
		}, {
			key: string;
			resource?: any;
		}>, "many">;
	}, "strip", z.ZodTypeAny, {
		action: "fetchPermissions";
		rules: {
			key: string;
			resource?: any;
		}[];
	}, {
		action: "fetchPermissions";
		rules: {
			key: string;
			resource?: any;
		}[];
	}>
]>;
export type KilpiEndpointRequestBody = z.infer<typeof endpointRequestSchema>;
export type KilpiEndpointRequestAction = KilpiEndpointRequestBody["action"];

export {};
