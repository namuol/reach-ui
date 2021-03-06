import React, { useState } from "react";
import { render, act, withMarkup, userEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import matchSorter from "match-sorter";
import cities from "../examples/cities";

describe("<Combobox />", () => {
  describe("rendering", () => {
    it("renders as any HTML element", () => {
      jest.useFakeTimers();

      function MyCombobox() {
        let [term, setTerm] = useState("");
        let results = useCityMatch(term);

        return (
          <div>
            <Combobox data-testid="box" as="span">
              <ComboboxInput
                data-testid="input"
                as="textarea"
                onChange={(event: any) => setTerm(event.target.value)}
              />
              {results ? (
                <ComboboxPopover portal={false}>
                  <ComboboxList data-testid="list" as="div">
                    {showOpts(results, ({ result, index }) => (
                      <ComboboxOption
                        as="div"
                        key={index}
                        value={result.city}
                      />
                    ))}
                  </ComboboxList>
                </ComboboxPopover>
              ) : null}
            </Combobox>
          </div>
        );
      }

      let { getByTestId, getAllByRole } = render(<MyCombobox />);
      expect(getByTestId("box").tagName).toBe("SPAN");
      expect(getByTestId("input").tagName).toBe("TEXTAREA");

      // Type to show the list
      act(() => {
        userEvent.type(getByTestId("input"), "e");
        jest.advanceTimersByTime(100);
      });

      expect(getByTestId("list").tagName).toBe("DIV");
      expect(getAllByRole("option")[0].tagName).toBe("DIV");
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      jest.useRealTimers();
      let { container } = render(<BasicCombobox />);
      let results: AxeResults = null as any;
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe("user events", () => {
    it("should open a list on text entry", () => {
      jest.useFakeTimers();
      let optionToSelect = "Eagle Pass, Texas";
      let { getByTestId, getByText } = render(<BasicCombobox />);
      let getByTextWithMarkup = withMarkup(getByText);
      let input = getByTestId("input");
      act(() => {
        userEvent.type(input, "e");
        jest.advanceTimersByTime(100);
      });
      expect(getByTestId("list")).toBeInTheDocument();
      expect(getByTextWithMarkup(optionToSelect)).toBeInTheDocument();
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
function BasicCombobox() {
  let [term, setTerm] = useState("");
  let results = useCityMatch(term);

  const handleChange = (event: any) => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>Clientside Search</h2>
      <Combobox id="holy-smokes">
        <ComboboxInput
          aria-label="cool search"
          data-testid="input"
          name="awesome"
          onChange={handleChange}
        />
        {results ? (
          <ComboboxPopover portal={false}>
            <p>
              <button>Test focus</button>
            </p>
            <ComboboxList data-testid="list">
              {results.slice(0, 10).map((result, index) => (
                <ComboboxOption
                  key={index}
                  value={`${result.city}, ${result.state}`}
                />
              ))}
            </ComboboxList>
          </ComboboxPopover>
        ) : (
          <span>No Results!</span>
        )}
      </Combobox>
    </div>
  );
}

function useCityMatch(term: string) {
  return term.trim() === ""
    ? null
    : matchSorter(cities, term, {
        keys: [item => `${item.city}, ${item.state}`],
      });
}

function showOpts<R>(
  results: R[],
  render: (props: { result: R; index: number }) => React.ReactNode
) {
  return results.slice(0, 10).map((result, index) => render({ result, index }));
}
