import { BeforeAfter } from "./BeforeAfter";
import { Changelog } from "./Changelog";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { Lab } from "./Lab";
import { Manifesto } from "./Manifesto";
import { PrismLab } from "./PrismLab";
import { Process } from "./Process";
import { SkillSpectrum } from "./SkillSpectrum";
import { SystemPanel } from "./SystemPanel";
import { Tracklist } from "./Tracklist";

/**
 * Todas as seções abaixo do hero, na ordem da página. Fica num arquivo próprio
 * para o App carregar este pedaço depois do hero (React.lazy).
 */
export default function NewSections() {
  return (
    <>
      <Manifesto />
      <SkillSpectrum />
      <Process />
      <BeforeAfter />
      <Lab />
      <PrismLab />
      <SystemPanel />
      <Tracklist />
      <Changelog />
      <Faq />
      <Contact />
    </>
  );
}
