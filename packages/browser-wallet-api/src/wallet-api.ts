import {
    InjectedMessageHandler,
    createEventTypeFilter,
    EventType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { AccountTransactionPayload, AccountTransactionType } from '@concordium/web-sdk';
import { stringify } from './util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletEventHandler<T = any> = (payload: T) => void;

export interface IWalletApi {
    addChangeAccountListener(handler: WalletEventHandler<string>): void;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent.
     * @param parameters parameters for the initContract and updateContract transactions in JSON-like format.
     * @param schema schema used for the initContract and updateContract transactions to serialize the parameters. Should be base64 encoded.
     */
    sendTransaction(
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters: Record<string, unknown>,
        schema: string
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent.
     */
    sendTransaction(type: AccountTransactionType, payload: AccountTransactionPayload): Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signMessage(): Promise<any>;
    connect(): Promise<string | undefined>;
}

class WalletApi implements IWalletApi {
    private messageHandler = new InjectedMessageHandler();

    private connected = false;

    private eventHandlerMap: Map<EventType, WalletEventHandler[]> = new Map();

    constructor() {
        // set up event listeners
        this.handleEvent(EventType.ChangeAccount);
    }

    public addChangeAccountListener(handler: WalletEventHandler<string>) {
        this.addEventListener(EventType.ChangeAccount, handler);
    }

    /**
     * Sends a sign request to the Concordium Wallet and awaits the users action
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public signMessage(): Promise<any> {
        return this.sendMessage(MessageType.SignMessage, {});
    }

    /**
     * Requests connection to wallet. Resolves with account address or rejects if rejected in wallet.
     */
    public async connect(): Promise<string | undefined> {
        const response = await this.messageHandler.sendMessage<string | undefined | false>(MessageType.Connect);

        if (response === false) {
            throw new Error('Connection rejected');
        }

        this.connected = true;

        return response;
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public async sendTransaction(
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters?: Record<string, unknown>,
        schema?: string
    ): Promise<string> {
        const response = await this.sendMessage<string | undefined>(MessageType.SendTransaction, {
            type,
            payload: stringify(payload),
            parameters,
            schema,
        });

        if (!response) {
            throw new Error('Signing rejected');
        }

        return response;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async sendMessage<R>(type: MessageType, payload?: any): Promise<R> {
        if (!this.connected && !(await this.connect())) {
            throw new Error('Connection not allowed by wallet');
        }

        return this.messageHandler.sendMessage<R>(type, payload);
    }

    private handleEvent(type: EventType) {
        this.messageHandler.handleMessage(createEventTypeFilter(type), (msg) =>
            this.eventHandlerMap.get(type)?.forEach((eh) => eh(msg.payload))
        );
    }

    private addEventListener(type: EventType, handler: WalletEventHandler) {
        this.eventHandlerMap.set(type, this.eventHandlerMap.get(type) ?? [handler]);
    }
}

export const walletApi = new WalletApi();
