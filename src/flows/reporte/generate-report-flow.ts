import { addKeyword, EVENTS } from "@builderbot/bot";
import { TIMER_END_PROCESS } from "~/constants/timer.constant";
import { ADVANCE_MESSAGE, CITY_MESSAGE, COMPANY_MESSAGE, COST_CENTER_MESSAGE, DEPENDENCY_MESSAGE, DOCUMENT_MESSAGE, GENERATE_REPORT_DATA_MESSAGE, MOTIVATION_MESSAGE, NAME_MESSAGE, ORIGIN_DATE_MESSAGE, RESUMEN_MESSAGE, RETURN_DATE_MESSAGE, VALIDATION_DATA_REPORT_MESSAGE } from "~/constants/travels/report.constant";
import { cancelReportFlow } from "~/services/cancel.service";
import { reset, start, stop } from "~/services/idle-custom.service";
import { startFlow, tripSelectFlow } from "../start";
import { AFFIRMATIVE_RESPONSES, ERROR_RESPONSE_S_N_MESSAGE, NEGATIVE_RESPONSES } from "~/constants/general-responses.constant";
import { editReportDataFlow } from "./edit-report-data-flow";
import { createReportDataFlow } from "./create-report-data-flow";

export const generateReportFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(GENERATE_REPORT_DATA_MESSAGE)
    .addAction(async (ctx, { state, gotoFlow }) => start(ctx, gotoFlow, TIMER_END_PROCESS, state, 0))
    .addAnswer(COMPANY_MESSAGE,
        {
            capture: true,
            delay: 2000
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const compania = context.body;

            await cancelReportFlow('compania', compania, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(DEPENDENCY_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const dependencia = context.body;

            await cancelReportFlow('dependencia', dependencia, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(COST_CENTER_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const centroCosto = context.body;

            await cancelReportFlow('centroCosto', centroCosto, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(NAME_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const nombre = context.body;

            await cancelReportFlow('nombre', nombre, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(DOCUMENT_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const documento = context.body;

            await cancelReportFlow('documento', documento, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(CITY_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const ciudad = context.body;

            await cancelReportFlow('ciudad', ciudad, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(MOTIVATION_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const motivo = context.body;

            await cancelReportFlow('motivo', motivo, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(ORIGIN_DATE_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const fechaIda = context.body;

            await cancelReportFlow('fechaIda', fechaIda, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(RETURN_DATE_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const fechaRegreso = context.body.toLowerCase().trim();

            await cancelReportFlow('fechaRegreso', fechaRegreso, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(ADVANCE_MESSAGE,
        {
            capture: true
        },
        async (context, { state, flowDynamic, gotoFlow }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const anticipo = context.body.toLowerCase().trim();

            await cancelReportFlow('anticipo', anticipo, flowDynamic, gotoFlow, state, tripSelectFlow);

        }
    )
    .addAnswer(RESUMEN_MESSAGE,
        null,
        async (context, { state, flowDynamic }) => {

            const compania = state.get("compania");

            const dependencia = state.get("dependencia");

            const centroCosto = state.get("centroCosto");

            const nombre = state.get("nombre");

            const documento = state.get("documento");

            const ciudad = state.get("ciudad");

            const motivo = state.get("motivo");

            const fechaIda = state.get("fechaIda");

            const fechaRegreso = state.get("fechaRegreso");

            const anticipo = state.get("anticipo");

            await state.update(
                {
                    datosUser: {
                        compania,
                        dependencia,
                        centroCosto,
                        nombre,
                        documento,
                        ciudad,
                        motivo,
                        fechaIda,
                        fechaRegreso,
                        anticipo
                    }
                }
            );

            await flowDynamic([
                `Compañía: ${compania}`,
                `Dependencia: ${dependencia}`,
                `Centro de costo: ${centroCosto}`,
                '',
                `Nombre: ${nombre}`,
                `Documento: ${documento}`,
                '',
                `Ciudad del viaje: ${ciudad}`,
                `Motivo del viaje: ${motivo}`,
                '',
                `Fecha de ida: ${fechaIda}`,
                `Fecha de regreso: ${fechaRegreso}`,
                '',
                `Total anticipo: ${anticipo}`,
            ].join("\n"));


        }
    )
    .addAnswer(VALIDATION_DATA_REPORT_MESSAGE,
        {
            capture: true
        },
        async (context, { state, gotoFlow, fallBack }) => {

            reset(context, gotoFlow, TIMER_END_PROCESS, state, 0);

            const response = context.body.toLowerCase().trim();

            const affirmativeResponses = AFFIRMATIVE_RESPONSES;

            const negativeResponses = NEGATIVE_RESPONSES;

            if (negativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(editReportDataFlow);

            } else if (affirmativeResponses.includes(response)) {

                stop(context);

                return gotoFlow(createReportDataFlow);


            } else {

                return fallBack(ERROR_RESPONSE_S_N_MESSAGE);

            }


        }
    )