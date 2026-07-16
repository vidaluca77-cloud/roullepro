/**
 * Barrel — re-exporte les 7 fonctions render* des templates e-mail sanitaire.
 */

export { renderInscriptionAccuse }   from "./inscription-accuse";
export { renderInscriptionConfirmEmail } from "./inscription-confirm-email";
export { renderInscriptionAdmin }    from "./inscription-admin";
export { renderClaimOtp }            from "./claim-otp";
export { renderClaimBienvenue }      from "./claim-bienvenue";
export { renderClaimAdmin }          from "./claim-admin";
export { renderValidateDecision }    from "./validate-decision";
export { renderNewsletterBlogBienvenue } from "./newsletter-blog-bienvenue";
export { renderDripJ3Essai }         from "./drip-j3-essai";
export { renderDripJ7Resultats }     from "./drip-j7-resultats";
export { renderDripJ13PreExpire }    from "./drip-j13-pre-expire";
export { renderTrialWillEnd }        from "./trial-will-end";

// Types publics
export type { InscriptionAccuseParams }       from "./inscription-accuse";
export type { InscriptionConfirmEmailParams } from "./inscription-confirm-email";
export type { InscriptionAdminParams }        from "./inscription-admin";
export type { ClaimOtpParams }                from "./claim-otp";
export type { ClaimBienvenueParams }          from "./claim-bienvenue";
export type { ClaimAdminParams }              from "./claim-admin";
export type { ValidateDecisionParams }        from "./validate-decision";
export type { NewsletterBlogBienvenueParams } from "./newsletter-blog-bienvenue";
export type { DripJ3Params }                  from "./drip-j3-essai";
export type { DripJ7Params }                  from "./drip-j7-resultats";
export type { DripJ13PreExpireParams }        from "./drip-j13-pre-expire";
export type { TrialWillEndParams }            from "./trial-will-end";
