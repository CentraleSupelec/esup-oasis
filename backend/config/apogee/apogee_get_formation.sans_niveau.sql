-- Variante de apogee_get_formation.sql pour les instances Apogée qui ne
-- disposent pas de la table de correspondance des niveaux d'étape
-- (apogee.extern_niveau_etape), laquelle n'est pas présente partout.
--
-- Sans elle, la requête de référence échoue et laisse diplôme, discipline et
-- niveau vides. Cette variante renvoie donc le niveau à blanc : le niveau LMD
-- est de toute façon dérivé côté Oasis à partir du cycle et de l'année dans le
-- diplôme, tandis que diplôme et discipline restent correctement alimentés.
--
-- Pour l'utiliser, faire pointer APOGEE_REQUETE_FORMATION sur ce fichier.
select dip.lib_dip, ' ' as niveau, dsi.lib_dsi
from version_etape vet
         join vdi_fractionner_vet vdv on vet.COD_ETP = vdv.COD_ETP and vet.COD_VRS_VET = vdv.COD_VRS_VET
         join version_diplome vdi on vdv.COD_DIP = vdi.COD_DIP and vdv.COD_VRS_VDI = vdi.COD_VRS_VDI
         join diplome dip on dip.cod_dip = vdi.cod_dip
         left outer join sec_dis_sis sds on sds.cod_sds = dip.cod_sds
         left outer join discipline_sis dsi on dsi.cod_dsi = sds.cod_dsi
where vet.cod_etp = :codEtp
  and vet.cod_vrs_vet = :codVrsVet
